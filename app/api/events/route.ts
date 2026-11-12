import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// Public: Get all events (active for customer, or all for admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const admin = await getCurrentAdmin();
    const whereClause = admin && all ? {} : { isActive: true };

    const events = await prisma.promoEvent.findMany({
      where: whereClause,
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { notifications: true },
        },
      },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: unknown) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Gagal memuat data event" }, { status: 500 });
  }
}

// Admin only: Create new event & broadcast notification
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Sesi admin diperlukan." }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      code,
      description,
      bannerText,
      discountPercent,
      eventMonth,
      eventDay,
      startDate,
      endDate,
      isActive,
      broadcastNotification = true,
    } = body;

    if (!title || !code) {
      return NextResponse.json({ error: "Judul dan Kode Event wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    // Check duplicate code
    const existing = await prisma.promoEvent.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return NextResponse.json({ error: "Kode event sudah ada, gunakan kode lain." }, { status: 400 });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days default

    const event = await prisma.promoEvent.create({
      data: {
        title: title.trim(),
        code: cleanCode,
        description: description || `Promo Spesial ${title} BeautyCare dengan potongan hingga ${discountPercent || 20}%.`,
        bannerText: bannerText || `🎉 Event Spesial ${title}! Diskon Ekstra ${discountPercent || 20}% untuk Semua Produk!`,
        discountPercent: Number(discountPercent) || 20,
        eventMonth: eventMonth ? Number(eventMonth) : null,
        eventDay: eventDay ? Number(eventDay) : null,
        startDate: start,
        endDate: end,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    // Automatically create a broadcast notification for all customers if requested
    if (broadcastNotification) {
      await prisma.notification.create({
        data: {
          eventId: event.id,
          title: `🔥 Promo Spesial: ${event.title}!`,
          message: event.description,
          type: "EVENT",
          link: "/#katalog",
        },
      });
    }

    return NextResponse.json({ success: true, message: "Event berhasil dibuat!", event });
  } catch (error: unknown) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Gagal membuat event promo." }, { status: 500 });
  }
}
