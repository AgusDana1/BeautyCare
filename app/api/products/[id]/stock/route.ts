import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function PATCH(
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
    const { variantId, stock } = body;

    const newStock = parseInt(stock, 10);
    if (isNaN(newStock) || newStock < 0) {
      return NextResponse.json(
        { error: "Nilai stok harus berupa angka positif" },
        { status: 400 }
      );
    }

    if (variantId) {
      // Update specific variant stock
      const updatedVariant = await prisma.productVariant.update({
        where: { id: parseInt(variantId, 10) },
        data: { stock: newStock },
      });

      // Recalculate total product stock
      const allVariants = await prisma.productVariant.findMany({
        where: { productId },
      });
      const totalStock = allVariants.reduce((sum, v) => sum + v.stock, 0);

      await prisma.product.update({
        where: { id: productId },
        data: { stock: totalStock },
      });

      return NextResponse.json({ success: true, updatedVariant, totalStock });
    } else {
      // Update base product stock
      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return NextResponse.json({ success: true, updatedProduct });
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui stok produk" },
      { status: 500 }
    );
  }
}
