import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar artikel" },
      { status: 500 }
    );
  }
}
