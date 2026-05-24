/**
 * GET /api/profile
 *
 * Returns the authenticated user's gamification stats.
 * Called by ProfileView on mount and retry.
 *
 * Response: { xp: number, streak_days: number, lessons_done: number }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";

interface ProfileStats {
  xp:           number;
  streak_days:  number;
  lessons_done: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileStats | { error: string }>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Ensure row exists so new users get 0-values rather than a 404
    await query(
      `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );

    const [profile] = await query<ProfileStats>(
      `SELECT xp, streak_days, lessons_done FROM user_profiles WHERE user_id = $1`,
      [userId],
    );

    return res.status(200).json({
      xp:           profile?.xp           ?? 0,
      streak_days:  profile?.streak_days  ?? 0,
      lessons_done: profile?.lessons_done ?? 0,
    });
  } catch (err: unknown) {
    console.error("[profile/get]", err instanceof Error ? err.message : err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
