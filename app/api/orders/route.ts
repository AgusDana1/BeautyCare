import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

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
      where.orderStatus = orderStatus;
    }

    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      where.OR = [
        { invoiceNumber: { contains: search.trim() } },
        { customerName: { contains: search.trim() } },
        { customerPhone: { contains: search.trim() } },
        { customerEmail: { contains: search.trim() } },
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
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !customerAddress ||
      !paymentMethod ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Semua data pelanggan dan item pesanan wajib diisi lengkap" },
        { status: 400 }
      );
    }

    // Generate Invoice Number
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
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

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

    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        customerName: customerName.trim(),
        customerEmail: customerEmail?.trim() || "",
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        paymentMethod,
        paymentChannel: paymentChannel || paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        totalAmount,
        notes: notes?.trim() || null,
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
