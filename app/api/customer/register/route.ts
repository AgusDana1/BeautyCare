import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createCustomerToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Create or link CustomerLoyalty if phone provided
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const existingLoyalty = await prisma.customerLoyalty.findUnique({
        where: { phone: cleanPhone },
      });
      if (!existingLoyalty) {
        await prisma.customerLoyalty.create({
          data: {
            phone: cleanPhone,
            name: user.name,
            email: user.email,
            points: 50, // Welcome bonus points!
            tier: "SILVER",
            history: {
              create: {
                points: 50,
                type: "EARN",
                description: "Bonus pendaftaran akun member baru BeautyCare",
              },
            },
          },
        });
      }
    }

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Selamat Datang di BeautyCare! 🎉",
        message: `Halo ${user.name}, akun Anda berhasil dibuat. Dapatkan bonus poin loyalitas dan nikmati update event diskon spesial setiap bulannya!`,
        type: "SYSTEM",
        link: "/#katalog",
      },
    });

    const token = createCustomerToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set("customer_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat pendaftaran akun." },
      { status: 500 }
    );
  }
}
