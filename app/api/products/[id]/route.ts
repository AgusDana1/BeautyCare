import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);
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

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock || "0", 10);
    const parsedCategoryId = parseInt(categoryId, 10);

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

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name.trim(),
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id, 10);

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
