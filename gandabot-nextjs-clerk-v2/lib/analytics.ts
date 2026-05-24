/**
 * GandaBot Analytics — thin wrapper around PostHog.
 *
 * Set NEXT_PUBLIC_POSTHOG_KEY in your environment to enable.
 * All calls are no-ops when the key is absent (safe in dev).
 *
 * Events tracked:
 *   app_opened          — every session start (AppShell mount)
 *   lesson_completed    — user finishes a curriculum lesson
 *   streak_extended     — daily streak increments
 *   feature_used        — any primary feature tab visited
 *   xp_earned           — XP awarded (with action + amount)
 */

// PostHog is loaded via CDN snippet (see _app.tsx) or the posthog-js package.
// We reference window.posthog so there's no hard npm dependency blocking builds.

type Properties = Record<string, string | number | boolean | null>;

function ph(): { capture?: (event: string, props?: Properties) => void } | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).posthog ?? null;
}

export function trackEvent(event: string, properties?: Properties): void {
  try {
    ph()?.capture?.(event, properties);
  } catch {
    // never crash the app due to analytics
  }
}

// ─── Typed event helpers ──────────────────────────────────────────────────────

export const Analytics = {
  appOpened: () =>
    trackEvent("app_opened"),

  lessonCompleted: (lessonId: number, lessonTitle: string, unit: number) =>
    trackEvent("lesson_completed", { lesson_id: lessonId, lesson_title: lessonTitle, unit }),

  streakExtended: (days: number, xpAwarded: number) =>
    trackEvent("streak_extended", { streak_days: days, xp_awarded: xpAwarded }),

  featureUsed: (feature: string) =>
    trackEvent("feature_used", { feature }),

  xpEarned: (action: string, amount: number) =>
    trackEvent("xp_earned", { action, amount }),
};
