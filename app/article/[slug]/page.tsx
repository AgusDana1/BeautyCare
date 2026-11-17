import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ArticleDetailClient from "./ArticleDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan - BeautyCare Edukasi",
    };
  }

  return {
    title: `${article.title} - Edukasi BeautyCare`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : [],
      type: "article",
    },
  };
}

async function ArticleContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await paramsPromise;

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  // Fetch recommended products to feature inside the article
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        orderBy: { sizeValue: "asc" },
      },
      reviews: true,
    },
    take: 3,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedProducts = products.map((p: any) => ({
    ...p,
    price: Number(p.price),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      price: Number(v.price),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: (p.reviews || []).map((r: any) => ({
      ...r,
      createdAt: typeof r.createdAt === "string" ? r.createdAt : r.createdAt.toISOString(),
    })),
  }));

  const sanitizedArticle = {
    ...article,
    publishedAt: article.publishedAt.toISOString(),
  };

  return (
    <ArticleDetailClient
      article={sanitizedArticle}
      recommendedProducts={sanitizedProducts}
    />
  );
}

export default function ArticlePage({
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
              Memuat Edukasi BeautyCare...
            </span>
          </div>
        </div>
      }
    >
      <ArticleContent paramsPromise={params} />
    </Suspense>
  );
}
