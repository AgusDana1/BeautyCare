import { Suspense } from "react";
import { connection } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

async function AdminContent() {
  await connection();

  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  // Fetch initial data
  const [categories, products, orders] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      include: {
        category: true,
        variants: {
          orderBy: { sizeValue: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Sanitize data for client components
  const sanitizedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    _count: c._count,
  }));

  const sanitizedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    image: p.image,
    price: Number(p.price),
    stock: p.stock,
    hasVariants: p.hasVariants,
    categoryId: p.categoryId,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      description: p.category.description,
    },
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      size: v.size,
      sizeValue: v.sizeValue,
      price: Number(v.price),
      stock: v.stock,
    })),
  }));

  const sanitizedOrders = orders.map((o) => ({
    id: o.id,
    invoiceNumber: o.invoiceNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    customerAddress: o.customerAddress,
    paymentMethod: o.paymentMethod,
    paymentChannel: o.paymentChannel,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    totalAmount: Number(o.totalAmount),
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      selectedSize: item.selectedSize,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
      product: {
        name: item.product.name,
        image: item.product.image,
      },
    })),
  }));

  return (
    <AdminDashboardClient
      admin={admin}
      initialCategories={sanitizedCategories}
      initialProducts={sanitizedProducts}
      initialOrders={sanitizedOrders}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-rose-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-600">
              Memuat Dashboard Admin BeautyCare...
            </span>
          </div>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
