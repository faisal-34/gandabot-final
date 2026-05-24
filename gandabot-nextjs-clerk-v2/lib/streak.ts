/**
 * Streak helpers — client-side daily login detection.
 *
 * Flow:
 *   1. On app mount, call checkDailyStreak().
 *   2. It reads gandabot_last_seen from localStorage.
 *   3. If today's date differs from stored date:
 *      a. Call POST /api/profile/daily-login (server bumps streak + XP).
 *      b. Update localStorage so subsequent page navigations this session
 *         don't re-trigger the API call.
 *      c. Return the result so the caller can show a celebration toast.
 *   4. If same day → return { isNewDay: false } immediately, no API call.
 *
 * The localStorage guard means one API call per calendar day per device,
 * regardless of how many times the user refreshes or navigates.
 */

const LAST_SEEN_KEY = "gandabot_last_seen"; // "YYYY-MM-DD"

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface StreakResult {
  isNewDay:   boolean;
  streakDays: number;
  xpAwarded:  number;
}

/**
 * Check whether today is a new calendar day for this user.
 * Calls the daily-login API if so, then returns the streak state.
 *
 * Safe to call on every app mount — idempotent within the same day.
 */
export async function checkDailyStreak(): Promise<StreakResult> {
  const today   = todayKey();
  const lastSeen = (() => {
    try { return localStorage.getItem(LAST_SEEN_KEY); } catch { return null; }
  })();

  // Same day — don't call the API
  if (lastSeen === today) {
    return { isNewDay: false, streakDays: 0, xpAwarded: 0 };
  }

  // New day — call server, update local guard
  try {
    const res = await fetch("/api/profile/daily-login", { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Only write the guard when the server confirms a new day.
    // If the server says is_new_day: false (race / clock skew), don't write
    // so we retry on next mount rather than suppressing future calls.
    if (data.is_new_day) {
      try { localStorage.setItem(LAST_SEEN_KEY, today); } catch { /* quota */ }
    }

    return {
      isNewDay:   data.is_new_day  ?? false,
      streakDays: data.streak_days ?? 0,
      xpAwarded:  data.xp_awarded  ?? 0,
    };
  } catch {
    // Network failure — don't write localStorage so we retry later
    return { isNewDay: false, streakDays: 0, xpAwarded: 0 };
  }
}
