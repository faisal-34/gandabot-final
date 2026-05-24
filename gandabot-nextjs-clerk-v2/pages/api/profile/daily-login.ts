/**
 * POST /api/profile/daily-login
 *
 * Called once per calendar day when the user opens the app.
 * Handles streak tracking with full break/continuation logic:
 *
 *   • Same calendar day  → no-op (returns current state, is_new_day: false)
 *   • Consecutive day    → streak++, award +20 XP
 *   • Gap of > 1 day     → streak resets to 1, award +20 XP (fresh start)
 *
 * The user_profiles table is expected to have:
 *   user_id          TEXT PRIMARY KEY
 *   xp               INTEGER DEFAULT 0
 *   streak_days      INTEGER DEFAULT 0
 *   lessons_done     INTEGER DEFAULT 0
 *   last_login_date  DATE
 *
 * If the user_profiles row doesn't exist yet, this endpoint creates it (upsert).
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

interface DailyLoginResult {
  streak_days: number;
  xp: number;
  xp_awarded: number;
  is_new_day: boolean;
}

const XP_DAILY = 20;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DailyLoginResult | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const todayUTC = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    // ── Upsert profile row and get current state ───────────────────────────
    // INSERT ... ON CONFLICT ensures the row always exists before we update it.
    await query(
      `INSERT INTO user_profiles (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );

    const [profile] = await query<{
      xp: number;
      streak_days: number;
      last_login_date: string | null;
    }>(
      `SELECT xp, streak_days, last_login_date::text FROM user_profiles WHERE user_id = $1`,
      [userId],
    );

    const lastDate  = profile?.last_login_date ?? null;
    const streakNow = profile?.streak_days ?? 0;
    const xpNow     = profile?.xp ?? 0;

    // ── Already logged in today → no-op ───────────────────────────────────
    if (lastDate === todayUTC) {
      return res.status(200).json({
        streak_days: streakNow,
        xp:          xpNow,
        xp_awarded:  0,
        is_new_day:  false,
      });
    }

    // ── Calculate new streak ──────────────────────────────────────────────
    // "Yesterday" in UTC — compare against last_login_date
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    const newStreak = lastDate === yesterday
      ? streakNow + 1   // consecutive day — extend streak
      : 1;              // gap of ≥2 days — reset to 1

    const newXp = xpNow + XP_DAILY;

    // ── Persist ───────────────────────────────────────────────────────────
    await query(
      `UPDATE user_profiles
       SET xp = $1, streak_days = $2, last_login_date = $3
       WHERE user_id = $4`,
      [newXp, newStreak, todayUTC, userId],
    );

    return res.status(200).json({
      streak_days: newStreak,
      xp:          newXp,
      xp_awarded:  XP_DAILY,
      is_new_day:  true,
    });
  } catch (err: unknown) {
    console.error("[daily-login]", err instanceof Error ? err.message : err);
    return res.status(500).json({ error: "Failed to record daily login" });
  }
}
