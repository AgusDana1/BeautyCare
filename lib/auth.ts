import crypto from "crypto";
import { cookies } from "next/headers";
import { timingSafeStringEqual } from "./security";

// Base master secret from environment variable
const MASTER_SECRET =
  process.env.SESSION_SECRET || "beautycare-super-secret-key-2026-secure-session-production";

// Cryptographically separated secrets for Admin and Customer roles (Defense-in-Depth)
const ADMIN_SECRET = crypto
  .createHmac("sha256", MASTER_SECRET)
  .update("BEAUTYCARE_ADMIN_AUTH_ISOLATION_V1")
  .digest("hex");

const CUSTOMER_SECRET = crypto
  .createHmac("sha256", MASTER_SECRET)
  .update("BEAUTYCARE_CUSTOMER_AUTH_ISOLATION_V1")
  .digest("hex");

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

/**
 * Creates a cryptographically signed session token for Administrators
 */
export function createToken(payload: AdminSession): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      id: payload.id,
      username: payload.username,
      name: payload.name,
      email: payload.email,
      role: "ADMIN",
      tokenType: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");

  return `${header}.${data}.${signature}`;
}

/**
 * Verifies an Administrator session token with role enforcement and timing-safe check
 */
export function verifyToken(token: string): AdminSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    if (!header || !data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");

    if (!timingSafeStringEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Strict role & token type enforcement
    if (payload.tokenType !== "ADMIN" || payload.role !== "ADMIN") {
      return null;
    }

    return {
      id: Number(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      email: String(payload.email),
      role: "ADMIN",
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

/**
 * Creates a cryptographically signed session token for Customers
 */
export function createCustomerToken(payload: CustomerSession): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(
    JSON.stringify({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      role: "CUSTOMER",
      tokenType: "CUSTOMER",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", CUSTOMER_SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");

  return `${header}.${data}.${signature}`;
}

/**
 * Verifies a Customer session token with role enforcement and timing-safe check
 */
export function verifyCustomerToken(token: string): CustomerSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, data, signature] = parts;
    if (!header || !data || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", CUSTOMER_SECRET)
      .update(`${header}.${data}`)
      .digest("base64url");

    if (!timingSafeStringEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Strict role & token type enforcement
    if (payload.tokenType !== "CUSTOMER" || payload.role !== "CUSTOMER") {
      return null;
    }

    return {
      id: Number(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      phone: payload.phone ? String(payload.phone) : null,
      role: "CUSTOMER",
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
