import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/auth";
import { getClientIp, checkReviewRateLimit } from "@/lib/rateLimit";
import { sanitizeText, sanitizeUrl, sanitizeNumber } from "@/lib/security";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(request);

    // 1. Anti-Spam Rate Limiting for Reviews
    const rateLimit = checkReviewRateLimit(ip);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Terlalu banyak ulasan dikirim dalam waktu singkat. Mohon tunggu ${waitSeconds} detik.`,
        },
        { status: 429 }
      );
    }

    const { id } = await params;
    const numericProductId = parseInt(id, 10);
    if (isNaN(numericProductId)) {
      return NextResponse.json({ error: "ID produk tidak valid" }, { status: 400 });
    }

    // 2. Customer MUST be logged in
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: "Wajib login terlebih dahulu untuk memberikan penilaian produk." },
        { status: 401 }
      );
    }

    // 3. Customer MUST have purchased the product (Verified Buyer Guarantee)
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

    const numRating = sanitizeNumber(rating, 1, 5, 5);
    const cleanComment = sanitizeText(comment, 1000);
    const cleanMediaUrl = mediaUrl ? sanitizeUrl(mediaUrl) : null;
    const cleanMediaType = mediaType === "video" ? "video" : "image";
    const cleanVariant = sanitizeText(
      selectedVariant || purchase.items[0]?.selectedSize || "Ukuran Standar",
      40
    );

    if (cleanComment.length < 5) {
      return NextResponse.json(
        { error: "Ulasan komentar minimal 5 karakter teks valid." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: numericProductId,
        userId: customer.id,
        reviewerName: customer.name,
        rating: numRating,
        comment: cleanComment,
        userLocation: "Indonesia",
        userAvatar: null,
        mediaUrl: cleanMediaUrl,
        mediaType: cleanMediaType,
        selectedVariant: cleanVariant,
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
