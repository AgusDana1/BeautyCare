import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createCustomerToken } from "@/lib/auth";
import { getClientIp, checkCustomerRegisterRateLimit } from "@/lib/rateLimit";
import {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  validatePassword,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Anti-Bot / Anti-Spam Registration Rate Limiting
    const rateLimit = checkCustomerRegisterRateLimit(ip);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          error: `Batas pendaftaran akun terlampaui. Mohon tunggu ${waitMinutes} menit sebelum mendaftarkan akun baru lagi.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, password } = body;

    const cleanName = sanitizeText(name, 80);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = phone ? sanitizePhone(phone) : null;
    const pwdValidation = validatePassword(password);

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi minimal 2 karakter." },
        { status: 400 }
      );
    }

    if (!cleanEmail) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    if (!pwdValidation.valid) {
      return NextResponse.json(
        { error: pwdValidation.error || "Password tidak valid." },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email ini sudah terdaftar. Silakan gunakan email lain atau login." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Create or link CustomerLoyalty if phone provided
    if (cleanPhone) {
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
      { error: "Terjadi kesalahan pada sistem saat pendaftaran akun." },
      { status: 500 }
    );
  }
}
