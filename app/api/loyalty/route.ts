import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizePhone } from "@/lib/security";

function maskName(name: string | null): string {
  if (!name) return "Member";
  const parts = name.trim().split(" ");
  return parts
    .map((p) =>
      p.length > 2 ? p[0] + "*".repeat(Math.min(4, p.length - 2)) + p[p.length - 1] : p[0] + "*"
    )
    .join(" ");
}

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    const cleanPhone = sanitizePhone(phone);
    if (!cleanPhone) {
      return NextResponse.json(
        { error: "Nomor HP / WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    const member = await prisma.customerLoyalty.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { phone: phone ? phone.trim() : cleanPhone }],
      },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!member) {
      return NextResponse.json({
        found: false,
        phone: cleanPhone,
        points: 0,
        tier: "MEMBER BARU",
        discountValue: 0,
        message:
          "Nomor belum terdaftar di program loyalty. Poin akan otomatis mulai terkumpul pada pesanan pertama Anda!",
      });
    }

    // 1 poin bernilai Rp 100 potongan harga
    const discountValue = member.points * 100;

    return NextResponse.json({
      found: true,
      id: member.id,
      name: maskName(member.name),
      points: member.points,
      tier: member.tier,
      discountValue,
      history: member.history.map((h) => ({
        id: h.id,
        points: h.points,
        type: h.type,
        description: h.description,
        createdAt: h.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to query loyalty points:", error);
    return NextResponse.json(
      { error: "Gagal memproses data poin loyalitas" },
      { status: 500 }
    );
  }
}
