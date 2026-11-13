interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Global in-memory store for rate limiting with automatic cleanup
const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup every 60 seconds to prevent memory leaks
let cleanupTimerStarted = false;
function ensureCleanup() {
  if (cleanupTimerStarted) return;
  cleanupTimerStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000).unref?.();
}

/**
 * Extracts client IP from incoming Next.js Request headers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Checks rate limit for a given key within a sliding time window
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  ensureCleanup();
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Convenience Rate Limit Presets
 */

// Admin Login: Max 5 attempts / 15 minutes (Protection against brute-force)
export function checkAdminLoginRateLimit(ip: string) {
  return checkRateLimit(`admin_login_${ip}`, 5, 15 * 60 * 1000);
}

// Customer Login: Max 8 attempts / 15 minutes
export function checkCustomerLoginRateLimit(ip: string) {
  return checkRateLimit(`customer_login_${ip}`, 8, 15 * 60 * 1000);
}

// Customer Registration: Max 4 accounts / 30 minutes
export function checkCustomerRegisterRateLimit(ip: string) {
  return checkRateLimit(`customer_reg_${ip}`, 4, 30 * 60 * 1000);
}

// Order Checkout: Max 10 orders / 10 minutes (Anti-inventory depletion attack)
export function checkOrderRateLimit(ip: string) {
  return checkRateLimit(`order_create_${ip}`, 10, 10 * 60 * 1000);
}

// Review Submission: Max 5 reviews / 10 minutes
export function checkReviewRateLimit(ip: string) {
  return checkRateLimit(`review_create_${ip}`, 5, 10 * 60 * 1000);
}
