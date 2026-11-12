import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({ authenticated: false, customer: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: customer.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, customer: null }, { status: 200 });
    }

    // Get customer's orders and purchased product IDs
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { customerEmail: user.email },
          ...(user.phone ? [{ customerPhone: user.phone }] : []),
        ],
      },
      include: {
        items: {
          select: { productId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const purchasedProductIds = Array.from(
      new Set(orders.flatMap((o) => o.items.map((i) => i.productId)))
    );

    // Get loyalty points if phone available
    let loyaltyPoints = 0;
    let loyaltyTier = "SILVER";
    if (user.phone) {
      const cleanPhone = user.phone.replace(/[^0-9]/g, "");
      const loyalty = await prisma.customerLoyalty.findUnique({
        where: { phone: cleanPhone },
      });
      if (loyalty) {
        loyaltyPoints = loyalty.points;
        loyaltyTier = loyalty.tier;
      }
    }

    // Get notifications for this user + broadcast notifications (userId == null)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId: user.id }, { userId: null }],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            discountPercent: true,
            bannerText: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      authenticated: true,
      customer: {
        ...user,
        loyaltyPoints,
        loyaltyTier,
        purchasedProductIds,
        unreadNotificationsCount,
        notifications,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching current customer:", error);
    return NextResponse.json({ authenticated: false, customer: null }, { status: 200 });
  }
}
