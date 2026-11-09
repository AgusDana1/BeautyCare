import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { generateQrisString, generateQrCode } from "@/lib/qris";
import OrderConfirmationClient from "./OrderConfirmationClient";

async function OrderConfirmationContent({
  params,
}: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  await connection();

  const { invoiceNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { invoiceNumber },
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

  // Pre-generate QR code if QRIS
  let qrDataUrl = "";
  if (order.paymentMethod === "QRIS") {
    const qrisPayload = generateQrisString(order.invoiceNumber, Number(order.totalAmount));
    qrDataUrl = await generateQrCode(qrisPayload);
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

  return (
    <OrderConfirmationClient
      order={sanitizedOrder}
      initialQrDataUrl={qrDataUrl}
    />
  );
}

export default function OrderConfirmationPage(props: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-500 font-semibold">Memuat Data Pembayaran...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent params={props.params} />
    </Suspense>
  );
}
