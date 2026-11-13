import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, getCurrentCustomer } from "@/lib/auth";

const VALID_ORDER_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
]);

const VALID_PAYMENT_STATUSES = new Set(["PENDING", "PAID", "FAILED"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    // IDOR Protection: Determine requester identity
    const [admin, customer] = await Promise.all([
      getCurrentAdmin(),
      getCurrentCustomer(),
    ]);

    let order = null;

    if (!isNaN(numericId)) {
      // Query by Numeric ID: Restricted to Admin or the Order's Owner
      order = await prisma.order.findUnique({
        where: { id: numericId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
      }

      // Check authorization
      const isOwner =
        customer &&
        (order.userId === customer.id ||
          order.customerEmail.toLowerCase() === customer.email.toLowerCase());

      if (!admin && !isOwner) {
        return NextResponse.json(
          { error: "Akses ditolak. Anda tidak memiliki izin untuk melihat pesanan ini." },
          { status: 403 }
        );
      }

      return NextResponse.json(order);
    }

    // Query by Invoice Number (Non-sequential public reference code for confirmation page)
    const cleanInvoiceNumber = id.trim().toUpperCase();
    if (!/^INV-\d{8}-\d{4,}$/.test(cleanInvoiceNumber)) {
      return NextResponse.json(
        { error: "Format nomor invoice tidak valid." },
        { status: 400 }
      );
    }

    order = await prisma.order.findUnique({
      where: { invoiceNumber: cleanInvoiceNumber },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Strict Admin Authorization Check
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Sesi admin diperlukan." }, { status: 401 });
    }

    const { id } = await params;
    const numericId = parseInt(id, 10);
    const body = await request.json();
    const { orderStatus, paymentStatus } = body;

    const dataToUpdate: Record<string, string> = {};

    // Input Validation: Whitelist status values
    if (orderStatus) {
      const cleanOrderStatus = String(orderStatus).toUpperCase().trim();
      if (!VALID_ORDER_STATUSES.has(cleanOrderStatus)) {
        return NextResponse.json(
          { error: "Nilai status pesanan tidak valid." },
          { status: 400 }
        );
      }
      dataToUpdate.orderStatus = cleanOrderStatus;
    }

    if (paymentStatus) {
      const cleanPaymentStatus = String(paymentStatus).toUpperCase().trim();
      if (!VALID_PAYMENT_STATUSES.has(cleanPaymentStatus)) {
        return NextResponse.json(
          { error: "Nilai status pembayaran tidak valid." },
          { status: 400 }
        );
      }
      dataToUpdate.paymentStatus = cleanPaymentStatus;
    }

    const updated = await prisma.order.update({
      where: isNaN(numericId) ? { invoiceNumber: id.trim().toUpperCase() } : { id: numericId },
      data: dataToUpdate,
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pesanan." },
      { status: 500 }
    );
  }
}
