/**
 * Shared utility functions — small, pure, and dependency-free.
 */

// ─── Validation ────────────────────────────────────────────────────────────────

/** Basic email format validation (not exhaustive — use server-side validation for auth) */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Valid GandaBot username: 1-32 chars, letters/numbers/underscores only */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{1,32}$/.test(username);
}

// ─── String helpers ────────────────────────────────────────────────────────────

/** Capitalize the first letter of a string */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncate a string to `maxLen` chars, appending "…" when truncated */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Format a date as a relative time string (e.g. "3 days ago", "just now").
 * Falls back to a locale date string for dates older than 30 days.
 */
export function relativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)} days ago`;

  return d.toLocaleDateString();
}

// ─── Number helpers ────────────────────────────────────────────────────────────

/** Format a large number with a suffix: 1500 → "1.5K", 2000000 → "2M" */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

// ─── Network / API helpers ────────────────────────────────────────────────────

/**
 * Extract the client IP from a Next.js request.
 * Checks X-Forwarded-For first (set by Vercel / reverse proxies),
 * then falls back to a placeholder for local dev.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

/**
 * Build a standard JSON error response.
 *
 * @example
 *   return errorResponse("Not found", 404);
 */
export function errorResponse(message: string, status = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Build a standard JSON success response.
 *
 * @example
 *   return jsonResponse({ translation: result });
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
