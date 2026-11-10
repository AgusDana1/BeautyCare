import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan - BeautyCare",
    };
  }

  return {
    title: `${product.name} - BeautyCare Official`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | BeautyCare`,
      description: product.description.slice(0, 160),
      images: product.image ? [product.image] : [],
    },
  };
}

async function ProductContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await paramsPromise;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { sizeValue: "asc" },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: true,
      variants: {
        orderBy: { sizeValue: "asc" },
      },
      reviews: true,
    },
    take: 4,
  });

  const sanitizedProduct = {
    ...product,
    price: Number(product.price),
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
    reviews: product.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const sanitizedRelated = relatedProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    variants: p.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),
    reviews: p.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <ProductDetailClient
      product={sanitizedProduct}
      relatedProducts={sanitizedRelated}
    />
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f5] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-600">
              Memuat Rincian Produk BeautyCare...
            </span>
          </div>
        </div>
      }
    >
      <ProductContent paramsPromise={params} />
    </Suspense>
  );
}
