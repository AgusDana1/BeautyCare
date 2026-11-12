import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SESSION_SECRET || "beautycare-super-secret-key-2026-secure-session";

export interface AdminSession {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface CustomerSession {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
}

export function createToken(payload: AdminSession): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): AdminSession | null {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${header}.${data}`)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8")
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function createCustomerToken(payload: CustomerSession): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyCustomerToken(token: string): CustomerSession | null {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(`${header}.${data}`)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf-8"),
        Buffer.from(expectedSignature, "utf-8")
      )
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role || "CUSTOMER",
    };
  } catch {
    return null;
  }
}

export async function getCurrentCustomer(): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("customer_session")?.value;
    if (!token) return null;
    return verifyCustomerToken(token);
  } catch {
    return null;
  }
}
