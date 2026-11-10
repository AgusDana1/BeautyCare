import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import StorefrontClient from "./StorefrontClient";

async function HomeContent() {
  await connection();

  const [categories, products, articles] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      include: {
        category: true,
        variants: {
          orderBy: { sizeValue: "asc" },
        },
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
  ]);

  // Sanitize decimals & dates for client
  const sanitizedProducts = products.map((p) => ({
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

  const sanitizedArticles = articles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt.toISOString(),
  }));

  return (
    <StorefrontClient
      initialCategories={categories}
      initialProducts={sanitizedProducts}
      initialArticles={sanitizedArticles}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf7f5] flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-stone-600">
              Memuat Koleksi BeautyCare...
            </span>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
