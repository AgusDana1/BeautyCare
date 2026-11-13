import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createCustomerToken } from "@/lib/auth";
import { getClientIp, checkCustomerLoginRateLimit } from "@/lib/rateLimit";
import { sanitizeText, validatePassword } from "@/lib/security";

const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF0123456789dummyhashdemo";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limit to prevent brute force & credential stuffing
    const rateLimit = checkCustomerLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Mohon tunggu ${waitSeconds} detik sebelum mencoba lagi.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(waitSeconds) },
        }
      );
    }

    const body = await request.json();
    const { identifier, password } = body;

    const cleanIdentifier = sanitizeText(identifier, 100);
    const pwdValidation = validatePassword(password);

    if (!cleanIdentifier || !pwdValidation.valid) {
      return NextResponse.json(
        { error: "Email/Nomor HP dan password wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier.toLowerCase() },
          { phone: cleanIdentifier },
        ],
      },
    });

    // Constant-time execution to prevent timing-based user enumeration
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      return NextResponse.json(
        { error: "Email/Nomor HP atau password yang Anda masukkan tidak sesuai." },
        { status: 401 }
      );
    }

    const token = createCustomerToken({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat proses login." },
      { status: 500 }
    );
  }
}
