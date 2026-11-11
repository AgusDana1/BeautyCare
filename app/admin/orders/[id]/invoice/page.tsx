import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import InvoiceClientView from "./InvoiceClientView";

async function InvoiceContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();

  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const numericId = parseInt(id, 10);

  const order = await prisma.order.findFirst({
    where: isNaN(numericId) ? { invoiceNumber: id } : { id: numericId },
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
    notFound();
  }

  const sanitizedOrder = {
    id: order.id,
    invoiceNumber: order.invoiceNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    paymentMethod: order.paymentMethod,
    paymentChannel: order.paymentChannel,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    totalAmount: Number(order.totalAmount),
    pointsEarned: order.pointsEarned,
    pointsRedeemed: order.pointsRedeemed,
    discountAmount: Number(order.discountAmount || 0),
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      selectedSize: item.selectedSize,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      product: {
        name: item.product.name,
        image: item.product.image,
      },
    })),
  };

  return <InvoiceClientView order={sanitizedOrder} />;
}

export default function AdminOrderInvoicePage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-500 font-semibold">Memuat Faktur Resmi...</p>
          </div>
        </div>
      }
    >
      <InvoiceContent params={props.params} />
    </Suspense>
  );
}
