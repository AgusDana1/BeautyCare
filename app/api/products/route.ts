import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const search = searchParams.get("search");
    const sizeParam = searchParams.get("size"); // e.g. "30ml", "50ml"
    const sortBy = searchParams.get("sortBy") || "latest";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (categoryParam && categoryParam !== "all") {
      const catId = parseInt(categoryParam, 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      } else {
        where.category = { slug: categoryParam };
      }
    }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    if (sizeParam && sizeParam !== "all") {
      where.variants = {
        some: {
          size: { equals: sizeParam },
        },
      };
    }

    // Build orderBy
    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (sortBy === "stock") {
      orderBy = { stock: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: {
          orderBy: { sizeValue: "asc" },
        },
        reviews: true,
      },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar produk" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      price,
      stock,
      image,
      hasVariants,
      variants,
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Nama, Kategori, dan Harga wajib diisi" },
        { status: 400 }
      );
    }

    const slug = `${name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}-${Date.now().toString().slice(-4)}`;

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock || "0", 10);
    const parsedCategoryId = parseInt(categoryId, 10);

    // Variants handling
    let variantCreates: Array<{
      size: string;
      sizeValue: number | null;
      price: number;
      stock: number;
    }> = [];

    let totalStock = parsedStock;

    if (hasVariants && Array.isArray(variants) && variants.length > 0) {
      variantCreates = variants.map((v: { size: string; price?: number | string; stock?: number | string }) => {
        const sizeNumMatch = v.size.match(/\d+/);
        const sizeValue = sizeNumMatch ? parseInt(sizeNumMatch[0], 10) : null;
        const vPrice = v.price !== undefined ? parseFloat(String(v.price)) : parsedPrice;
        const vStock = v.stock !== undefined ? parseInt(String(v.stock), 10) : 0;
        return {
          size: v.size.trim(),
          sizeValue,
          price: vPrice,
          stock: vStock,
        };
      });

      totalStock = variantCreates.reduce((acc, curr) => acc + curr.stock, 0);
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || "",
        image: image?.trim() || null,
        price: parsedPrice,
        stock: totalStock,
        hasVariants: Boolean(hasVariants && variantCreates.length > 0),
        categoryId: parsedCategoryId,
        variants: variantCreates.length > 0
          ? {
              create: variantCreates,
            }
          : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Gagal membuat produk baru" },
      { status: 500 }
    );
  }
}
