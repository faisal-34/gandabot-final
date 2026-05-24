/**
 * In-memory rate limiter.
 *
 * ⚠ Important: this runs inside a single Next.js server process. On Vercel
 * each serverless function instance has its own memory, so limits are per-
 * instance, not globally across all instances. For a globally-consistent
 * limiter, use Upstash Redis (https://upstash.com) with `@upstash/ratelimit`.
 *
 * This implementation is suitable for:
 *  - Single-server / Docker deployments
 *  - Vercel where per-instance limiting is an acceptable approximation
 *    (the limit effectively becomes: `limit × number_of_active_instances`)
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Purge expired entries every minute to prevent unbounded memory growth
const _cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

// Prevent the timer from blocking Node.js process shutdown
if (typeof _cleanupTimer === "object" && "unref" in _cleanupTimer) {
  (_cleanupTimer as NodeJS.Timeout).unref();
}

export interface RateLimitResult {
  allowed: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Milliseconds until the window resets (0 when allowed) */
  retryAfterMs: number;
  /** Unix timestamp (ms) when the current window resets */
  resetAt: number;
}

/**
 * Check and increment the rate limit for a given key.
 *
 * @param key       Unique identifier — e.g. userId, IP address, or `${userId}:${route}`
 * @param limit     Maximum requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  // New window (or first request)
  if (!existing || now > existing.resetAt) {
    const entry: Entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0, resetAt: entry.resetAt };
  }

  // Window still active but limit exceeded
  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      resetAt: existing.resetAt,
    };
  }

  // Increment and allow
  existing.count++;
  return {
    allowed: true,
    remaining: limit - existing.count,
    retryAfterMs: 0,
    resetAt: existing.resetAt,
  };
}

/**
 * Helper: build a rate-limit key that combines a user/IP identifier with
 * an optional route name, so each endpoint has its own independent bucket.
 *
 * @example
 *   const key = rateLimitKey(userId, "gandabot-chat");
 *   const { allowed } = rateLimit(key, 20, 60_000);
 */
export function rateLimitKey(identifier: string, route?: string): string {
  return route ? `${identifier}:${route}` : identifier;
}

/**
 * Convenience: apply rate-limiting and return a ready-to-send 429 Response
 * when the limit is exceeded.
 *
 * Returns `null` if the request is allowed (caller should proceed normally).
 *
 * @example
 *   const blocked = checkRateLimit(userId, "tts", 10, 60_000);
 *   if (blocked) return blocked;
 */
export function checkRateLimit(
  identifier: string,
  route: string,
  limit: number,
  windowMs: number,
): Response | null {
  const key = rateLimitKey(identifier, route);
  const result = rateLimit(key, limit, windowMs);

  if (!result.allowed) {
    const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
    return new Response(
      JSON.stringify({
        error: "Too many requests — please slow down.",
        retryAfterSeconds: retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
        },
      },
    );
  }

  return null;
}
