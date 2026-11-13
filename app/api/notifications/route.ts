import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer, getCurrentAdmin } from "@/lib/auth";
import { sanitizeText, sanitizeUrl } from "@/lib/security";

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
    const [customer, admin] = await Promise.all([
      getCurrentCustomer(),
      getCurrentAdmin(),
    ]);

    const body = await request.json();
    const { notificationId, title, message, eventId, type, link } = body;

    // Admin can create broadcast notifications
    if (title && admin) {
      const cleanTitle = sanitizeText(title, 100);
      const cleanMessage = sanitizeText(message, 500);
      const cleanLink = link ? sanitizeUrl(link) || "/#katalog" : "/#katalog";

      const created = await prisma.notification.create({
        data: {
          title: cleanTitle,
          message: cleanMessage,
          eventId: eventId ? Number(eventId) : null,
          type: type || "EVENT",
          link: cleanLink,
        },
      });
      return NextResponse.json({ success: true, notification: created });
    }

    // Customer marking read
    if (customer) {
      if (notificationId) {
        const numId = Number(notificationId);
        if (!isNaN(numId)) {
          await prisma.notification.updateMany({
            where: {
              id: numId,
              OR: [{ userId: customer.id }, { userId: null }],
            },
            data: { isRead: true },
          });
        }
      } else {
        // Mark all read for this customer
        await prisma.notification.updateMany({
          where: { userId: customer.id },
          data: { isRead: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi" }, { status: 500 });
  }
}
