import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { sanitizeText, sanitizeNumber } from "@/lib/security";

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
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID event tidak valid." }, { status: 400 });
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
    } = body;

    const updated = await prisma.promoEvent.update({
      where: { id: numericId },
      data: {
        ...(title !== undefined && { title: sanitizeText(title, 100) }),
        ...(code !== undefined && { code: sanitizeText(code, 30).toUpperCase().replace(/[^A-Z0-9_-]/g, "") }),
        ...(description !== undefined && { description: sanitizeText(description, 500) }),
        ...(bannerText !== undefined && { bannerText: sanitizeText(bannerText, 250) }),
        ...(discountPercent !== undefined && { discountPercent: sanitizeNumber(discountPercent, 1, 99, 20) }),
        ...(eventMonth !== undefined && { eventMonth: eventMonth ? sanitizeNumber(eventMonth, 1, 12, 1) : null }),
        ...(eventDay !== undefined && { eventDay: eventDay ? sanitizeNumber(eventDay, 1, 31, 1) : null }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return NextResponse.json({ success: true, message: "Event berhasil diperbarui", event: updated });
  } catch (error: unknown) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Gagal memperbarui event." }, { status: 500 });
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
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID event tidak valid." }, { status: 400 });
    }

    await prisma.promoEvent.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true, message: "Event berhasil dihapus." });
  } catch (error: unknown) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Gagal menghapus event." }, { status: 500 });
  }
}
