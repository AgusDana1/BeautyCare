import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, getCurrentCustomer } from "@/lib/auth";
import { getClientIp, checkOrderRateLimit } from "@/lib/rateLimit";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
} from "@/lib/security";

export async function GET(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderStatus = searchParams.get("orderStatus");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (orderStatus && orderStatus !== "ALL") {
      where.orderStatus = sanitizeText(orderStatus, 30);
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = sanitizeText(paymentStatus, 30);
    }

    if (search && search.trim()) {
      const cleanSearch = sanitizeText(search, 50);
      where.OR = [
        { invoiceNumber: { contains: cleanSearch } },
        { customerName: { contains: cleanSearch } },
        { customerPhone: { contains: cleanSearch } },
        { customerEmail: { contains: cleanSearch } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar pesanan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Anti-Inventory Depletion Rate Limiting
    const rateLimit = checkOrderRateLimit(ip);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Terlalu banyak pesanan dibuat dalam waktu singkat. Mohon tunggu ${waitSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      paymentMethod,
      paymentChannel,
      notes,
      items,
      redeemPoints,
    } = body;

    // 2. Strict Input Sanitization (Defense against Stored XSS)
    const cleanName = sanitizeText(customerName, 80);
    const cleanEmail = sanitizeEmail(customerEmail);
    const cleanPhone = sanitizePhone(customerPhone);
    const cleanAddress = sanitizeText(customerAddress, 250);
    const cleanNotes = sanitizeText(notes, 300);
    const cleanPaymentMethod = sanitizeText(paymentMethod, 30);
    const cleanPaymentChannel = sanitizeText(paymentChannel || paymentMethod, 30);

    if (
      !cleanName ||
      !cleanPhone ||
      !cleanAddress ||
      !cleanPaymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Semua data pelanggan dan item pesanan wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    // Limit maximum items per order to prevent resource exhaustion
    if (items.length > 30) {
      return NextResponse.json(
        { error: "Jumlah item dalam satu pesanan maksimal 30 varian." },
        { status: 400 }
      );
    }

    // Identify customer session if logged in
    const customer = await getCurrentCustomer();

    // Generate Invoice Number (Cryptographically random suffix)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    // Verify stock & calculate totals
    let totalAmount = 0;
    const orderItemsData: Array<{
      productId: number;
      variantId: number | null;
      selectedSize: string | null;
      quantity: number;
      price: number;
      subtotal: number;
    }> = [];

    for (const item of items) {
      const productId = parseInt(item.productId, 10);
      // Strictly enforce quantity between 1 and 50 to prevent integer overflow / abuse
      const quantity = Math.min(50, Math.max(1, parseInt(item.quantity, 10) || 1));

      if (isNaN(productId)) {
        return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Produk ID #${item.productId} tidak ditemukan` },
          { status: 404 }
        );
      }

      let unitPrice = Number(product.price);
      let selectedSize: string | null = null;
      let variantId: number | null = null;

      if (product.hasVariants && item.variantId) {
        const vId = parseInt(item.variantId, 10);
        const variant = product.variants.find((v) => v.id === vId);
        if (!variant) {
          return NextResponse.json(
            { error: `Varian ukuran tidak ditemukan untuk produk ${product.name}` },
            { status: 400 }
          );
        }

        if (variant.stock < quantity) {
          return NextResponse.json(
            {
              error: `Stok untuk ukuran ${variant.size} produk ${product.name} tidak mencukupi (tersisa: ${variant.stock})`,
            },
            { status: 400 }
          );
        }

        unitPrice = Number(variant.price);
        selectedSize = variant.size;
        variantId = variant.id;

        // Deduct variant stock
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: quantity } },
        });

        // Deduct product total stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      } else {
        // Product without variants
        if (product.stock < quantity) {
          return NextResponse.json(
            {
              error: `Stok produk ${product.name} tidak mencukupi (tersisa: ${product.stock})`,
            },
            { status: 400 }
          );
        }

        // Deduct product stock
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: quantity } },
        });
      }

      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        productId: product.id,
        variantId,
        selectedSize,
        quantity,
        price: unitPrice,
        subtotal,
      });
    }

    // Process Loyalty Points & Discounts
    let discountAmount = 0;
    let pointsRedeemed = 0;
    const cleanPhoneDigits = cleanPhone.replace(/[^0-9]/g, "");

    const loyaltyMember = await prisma.customerLoyalty.findFirst({
      where: {
        OR: [{ phone: cleanPhoneDigits }, { phone: cleanPhone }],
      },
    });

    const parsedRedeemPoints = sanitizeNumber(redeemPoints, 0, 1000000, 0);

    if (parsedRedeemPoints > 0 && loyaltyMember && loyaltyMember.points > 0) {
      // 1 poin = Rp 100 potongan harga, maksimal 50% dari total belanja
      const maxAllowedDiscount = Math.floor(totalAmount * 0.5);
      const requestedDiscount = Math.min(parsedRedeemPoints * 100, loyaltyMember.points * 100);
      discountAmount = Math.min(requestedDiscount, maxAllowedDiscount);
      pointsRedeemed = Math.floor(discountAmount / 100);

      // Potong poin dari akun loyalty
      if (pointsRedeemed > 0) {
        await prisma.customerLoyalty.update({
          where: { id: loyaltyMember.id },
          data: {
            points: { decrement: pointsRedeemed },
            history: {
              create: {
                points: -pointsRedeemed,
                type: "REDEEM",
                description: `Tukar ${pointsRedeemed} poin diskon pada pesanan ${invoiceNumber}`,
              },
            },
          },
        });
      }
    }

    const finalTotalAmount = Math.max(0, totalAmount - discountAmount);
    // Poin yang didapatkan: 1 poin tiap Rp 1.000 belanja
    const pointsEarned = Math.floor(finalTotalAmount / 1000);

    // Update / create member loyalty untuk poin yang diperoleh
    if (pointsEarned > 0) {
      if (loyaltyMember) {
        const newTotalSpent = Number(loyaltyMember.totalSpent) + finalTotalAmount;
        let newTier = loyaltyMember.tier;
        if (newTotalSpent >= 1500000) newTier = "PLATINUM";
        else if (newTotalSpent >= 500000) newTier = "GOLD";

        await prisma.customerLoyalty.update({
          where: { id: loyaltyMember.id },
          data: {
            points: { increment: pointsEarned },
            totalSpent: newTotalSpent,
            tier: newTier,
            name: cleanName,
            history: {
              create: {
                points: pointsEarned,
                type: "EARN",
                description: `Poin dari transaksi pesanan ${invoiceNumber}`,
              },
            },
          },
        });
      } else {
        await prisma.customerLoyalty.create({
          data: {
            phone: cleanPhoneDigits,
            name: cleanName,
            email: cleanEmail,
            points: pointsEarned,
            tier: "SILVER",
            totalSpent: finalTotalAmount,
            history: {
              create: {
                points: pointsEarned,
                type: "EARN",
                description: `Poin transaksi pertama pada pesanan ${invoiceNumber}`,
              },
            },
          },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        userId: customer ? customer.id : null,
        customerName: cleanName,
        customerEmail: cleanEmail || "",
        customerPhone: cleanPhone,
        customerAddress: cleanAddress,
        paymentMethod: cleanPaymentMethod,
        paymentChannel: cleanPaymentChannel,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        totalAmount: finalTotalAmount,
        discountAmount,
        pointsEarned,
        pointsRedeemed,
        notes: cleanNotes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesanan" },
      { status: 500 }
    );
  }
}
