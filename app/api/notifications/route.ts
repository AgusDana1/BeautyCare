import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    const where = customer
      ? {
          OR: [{ userId: customer.id }, { userId: null }],
        }
      : { userId: null }; // Broadcast notifications only if guest

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        event: {
          select: {
            title: true,
            discountPercent: true,
            bannerText: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: unknown) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      await prisma.notification.update({
        where: { id: Number(notificationId) },
        data: { isRead: true },
      });
    } else {
      // Mark all read for this customer
      await prisma.notification.updateMany({
        where: { userId: customer.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error marking notification read:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}
