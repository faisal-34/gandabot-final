/**
 * XP (experience points) — client-side award system.
 *
 * XP is awarded locally and synced to the server via /api/profile/xp.
 * Local state is optimistic: the UI updates immediately, and the server
 * persists it in the background. If the server call fails, we still keep
 * the local optimistic value so the UI doesn't flicker.
 *
 * XP actions and their values:
 *   chat_reply           +10   per AI response received
 *   translation          +15   per successful translation
 *   pronunciation_pass   +25   score ≥ 70
 *   pronunciation_great  +50   score ≥ 90
 *   podcast_generated    +30   per podcast episode created
 *   daily_login          +20   once per calendar day (streak bonus)
 *   community_post       +20   per post published
 *   lesson_complete      +50   per lesson completed in the curriculum
 */

export type XPAction =
  | "chat_reply"
  | "translation"
  | "pronunciation_pass"
  | "pronunciation_great"
  | "podcast_generated"
  | "daily_login"
  | "community_post"
  | "lesson_complete";

export const XP_VALUES: Record<XPAction, number> = {
  chat_reply:           10,
  translation:          15,
  pronunciation_pass:   25,
  pronunciation_great:  50,
  podcast_generated:    30,
  daily_login:          20,
  community_post:       20,
  lesson_complete:      50,
};

/**
 * Award XP for an action.
 * Syncs to /api/profile/xp in the background.
 * Returns the amount awarded so the caller can show a toast.
 */
export async function awardXP(action: XPAction): Promise<number> {
  const amount = XP_VALUES[action];

  // Fire-and-forget sync — don't block UI on network
  fetch("/api/profile/xp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, amount }),
  }).catch(() => {
    // Non-fatal — XP will re-sync on next profile load
  });

  return amount;
}

// ─── XP level thresholds (mirrors ProfileView) ────────────────────────────────

export const XP_LEVELS = [
  { label: "Beginner",  min: 0 },
  { label: "Learner",   min: 100 },
  { label: "Student",   min: 300 },
  { label: "Fluent",    min: 700 },
  { label: "Expert",    min: 1500 },
  { label: "Master",    min: 3000 },
];

export function getXPLevel(xp: number): { label: string; progress: number; nextMin?: number } {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) {
      const next = XP_LEVELS[i + 1];
      const progress = next
        ? ((xp - XP_LEVELS[i].min) / (next.min - XP_LEVELS[i].min)) * 100
        : 100;
      return { label: XP_LEVELS[i].label, progress: Math.min(progress, 100), nextMin: next?.min };
    }
  }
  return { label: "Beginner", progress: 0, nextMin: 100 };
}
