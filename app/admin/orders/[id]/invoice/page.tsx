import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceClientView from "./InvoiceClientView";

async function InvoiceContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();

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
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
      variant: item.variant
        ? {
            ...item.variant,
            price: Number(item.variant.price),
          }
        : null,
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
