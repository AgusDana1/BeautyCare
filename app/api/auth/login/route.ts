import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { getClientIp, checkAdminLoginRateLimit } from "@/lib/rateLimit";
import { sanitizeText, validatePassword } from "@/lib/security";

// Dummy hash for constant-time comparison when admin username is not found (prevents timing enumeration)
const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuvwxyzABCDEF0123456789dummyhashdemo";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Anti-Brute-Force & Anti-DDoS Rate Limiting
    const rateLimit = checkAdminLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login admin yang gagal. Silakan coba lagi dalam ${waitSeconds} detik.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(waitSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { identifier, password } = body;

    const cleanIdentifier = sanitizeText(identifier, 100);
    const pwdValidation = validatePassword(password);

    if (!cleanIdentifier || !pwdValidation.valid) {
      return NextResponse.json(
        { error: "Username/Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: {
        OR: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
      },
    });

    // Constant-time execution: always run bcrypt comparison even if admin doesn't exist
    const hashToCompare = admin ? admin.password : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!admin || !isMatch) {
      return NextResponse.json(
        { error: "Kredensial login tidak valid. Silakan periksa kembali username dan password Anda." },
        { status: 401 }
      );
    }

    const token = createToken({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat proses login." },
      { status: 500 }
    );
  }
}
