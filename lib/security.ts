import crypto from "crypto";

/**
 * Enterprise Security Utility Library
 * Provides robust sanitization, cryptographic timing safety, and input validation.
 */

// Constant-time string comparison using SHA-256 fixed-length digests
export function timingSafeStringEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const hashA = crypto.createHash("sha256").update(a, "utf8").digest();
  const hashB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// XSS Prevention: Sanitize text input by removing dangerous HTML, scripts, and event handlers
export function sanitizeText(val: unknown, maxLength = 1000): string {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();

  // Strip script tags and their contents
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Strip all other HTML tags
  str = str.replace(/<[^>]+>/g, "");

  // Strip dangerous pseudo-protocols and inline event handlers
  str = str.replace(/javascript:/gi, "");
  str = str.replace(/vbscript:/gi, "");
  str = str.replace(/data:\s*text\/html/gi, "");
  str = str.replace(/on\w+\s*=/gi, "");

  // Truncate to maximum length to prevent DoS via massive strings
  if (maxLength > 0 && str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str.trim();
}

// Email format validation & normalization
export function sanitizeEmail(email: unknown): string | null {
  if (!email || typeof email !== "string") return null;
  const cleaned = email.toLowerCase().trim();
  if (cleaned.length > 100) return null;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(cleaned)) return null;
  return cleaned;
}

// Phone number sanitization: digits only, length between 8 and 18
export function sanitizePhone(phone: unknown): string | null {
  if (!phone || typeof phone !== "string") return null;
  const digitsOnly = phone.replace(/[^0-9]/g, "");
  if (digitsOnly.length < 8 || digitsOnly.length > 18) return null;
  return digitsOnly;
}

// Safe URL validation for media attachments (photo/video)
// Only allows safe http: and https: protocols, strictly blocking javascript:, data:, file:, etc.
export function sanitizeUrl(url: unknown): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length > 2000) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    // Block local / internal IP addresses to prevent SSRF
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      (host.startsWith("172.") && /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host))
    ) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

// Password validation: enforces bounds to prevent bcrypt CPU exhaustion (DoS)
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password wajib diisi." };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password minimal 6 karakter." };
  }
  // Bcrypt only handles up to 72 bytes. Passwords longer than 72 characters can be used for DoS attacks
  if (password.length > 72) {
    return { valid: false, error: "Password maksimal 72 karakter." };
  }
  return { valid: true };
}

// Safe numeric parser with range clamps
export function sanitizeNumber(val: unknown, min = 0, max = 1000000000, defaultVal = 0): number {
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return defaultVal;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
