import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericProductId = parseInt(id, 10);
    if (isNaN(numericProductId)) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    // 1. Customer MUST be logged in
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Wajib login terlebih dahulu untuk memberikan penilaian produk." },
        { status: 401 }
      );
    }

    // 2. Customer MUST have purchased the product
    const purchase = await prisma.order.findFirst({
      where: {
        OR: [
          { userId: customer.id },
          { customerEmail: customer.email },
          ...(customer.phone ? [{ customerPhone: customer.phone }] : []),
        ],
        items: {
          some: { productId: numericProductId },
        },
      },
      include: {
        items: {
          where: { productId: numericProductId },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        {
          error:
            "Anda belum pernah memesan produk ini. Penilaian dan ulasan hanya dapat diberikan oleh pembeli yang telah membeli produk ini.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, comment, selectedVariant, mediaUrl, mediaType } = body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: "Rating bintang 1-5 wajib dipilih." }, { status: 400 });
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json(
        { error: "Ulasan komentar minimal 5 karakter." },
        { status: 400 }
      );
    }

    // Default variant if not passed
    const defaultVariant =
      selectedVariant ||
      purchase.items[0]?.selectedSize ||
      "Ukuran Standar";

    const review = await prisma.review.create({
      data: {
        productId: numericProductId,
        userId: customer.id,
        reviewerName: customer.name,
        rating: numRating,
        comment: comment.trim(),
        userLocation: "Indonesia",
        userAvatar: null,
        mediaUrl: mediaUrl?.trim() || null,
        mediaType: mediaType === "video" ? "video" : "image",
        selectedVariant: defaultVariant,
        helpfulCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ulasan & penilaian produk Anda berhasil dikirim!",
      review: {
        ...review,
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat mengirim ulasan." },
      { status: 500 }
    );
  }
}
