import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { sanitizeNumber } from "@/lib/security";

export async function PATCH(
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
      return NextResponse.json({ error: "ID produk tidak valid." }, { status: 400 });
    }

    const body = await request.json();
    const { variantId, stock } = body;

    const newStock = sanitizeNumber(stock, 0, 1000000, -1);
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Nilai stok harus berupa angka positif valid." },
        { status: 400 }
      );
    }

    if (variantId) {
      const vId = parseInt(variantId, 10);
      if (isNaN(vId)) {
        return NextResponse.json({ error: "ID varian tidak valid." }, { status: 400 });
      }

      // Update specific variant stock
      const updatedVariant = await prisma.productVariant.update({
        where: { id: vId },
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
