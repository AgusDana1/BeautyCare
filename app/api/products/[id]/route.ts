import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { sanitizeText, sanitizeUrl, sanitizeNumber } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          orderBy: { sizeValue: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail produk" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Sesi admin diperlukan." }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
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

    const cleanName = sanitizeText(name, 120);
    const cleanDescription = sanitizeText(description, 3000);
    const cleanImage = image ? sanitizeUrl(image) : null;
    const parsedPrice = sanitizeNumber(price, 0, 1000000000, 0);
    const parsedStock = sanitizeNumber(stock, 0, 1000000, 0);
    const parsedCategoryId = parseInt(categoryId, 10);

    if (!cleanName || isNaN(parsedCategoryId) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: "Nama, Kategori, dan Harga valid wajib diisi" },
        { status: 400 }
      );
    }

    // Delete existing variants and re-create if hasVariants is true
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    let variantCreates: Array<{
      size: string;
      sizeValue: number | null;
      price: number;
      stock: number;
    }> = [];

    let totalStock = parsedStock;

    if (hasVariants && Array.isArray(variants) && variants.length > 0) {
      variantCreates = variants.slice(0, 20).map((v: { size: string; price?: number | string; stock?: number | string }) => {
        const cleanSize = sanitizeText(v.size, 30);
        const sizeNumMatch = cleanSize.match(/\d+/);
        const sizeValue = sizeNumMatch ? parseInt(sizeNumMatch[0], 10) : null;
        const vPrice = v.price !== undefined ? sanitizeNumber(v.price, 0, 1000000000, parsedPrice) : parsedPrice;
        const vStock = v.stock !== undefined ? sanitizeNumber(v.stock, 0, 1000000, 0) : 0;
        return {
          size: cleanSize,
          sizeValue,
          price: vPrice,
          stock: vStock,
        };
      });

      totalStock = variantCreates.reduce((acc, curr) => acc + curr.stock, 0);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: cleanName,
        description: cleanDescription || "",
        image: cleanImage,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui produk" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Sesi admin diperlukan." }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}
