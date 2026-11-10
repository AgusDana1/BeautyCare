import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Nomor HP / WhatsApp diperlukan" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");

    const member = await prisma.customerLoyalty.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: phone },
        ],
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
        message: "Nomor belum terdaftar di program loyalty. Poin akan otomatis mulai terkumpul pada pesanan pertama Anda!",
      });
    }

    // 1 poin bernilai Rp 100 potongan harga
    const discountValue = member.points * 100;

    return NextResponse.json({
      found: true,
      id: member.id,
      name: member.name,
      phone: member.phone,
      points: member.points,
      tier: member.tier,
      totalSpent: Number(member.totalSpent),
      discountValue,
      history: member.history,
    });
  } catch (error) {
    console.error("Failed to query loyalty points:", error);
    return NextResponse.json(
      { error: "Gagal memuat data loyalty" },
      { status: 500 }
    );
  }
}
