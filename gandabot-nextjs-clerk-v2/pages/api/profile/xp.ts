/**
 * POST /api/profile/xp
 * Body: { action: XPAction, amount: number }
 *
 * Awards XP to the authenticated user.
 * The server re-derives the canonical amount from XP_VALUES to prevent
 * client-side tampering — the client-supplied `amount` is ignored.
 *
 * Returns: { xp: number, awarded: number }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { XP_VALUES, type XPAction } from "@/lib/xp";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action } = req.body as { action?: string };

  // Validate action and get server-authoritative amount
  const awarded = action ? XP_VALUES[action as XPAction] : undefined;
  if (!awarded) {
    return res.status(400).json({ error: `Unknown XP action: ${action}` });
  }

  try {
    // Ensure profile row exists (safe upsert)
    await query(
      `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );

    // Atomically add XP and return the new total
    const [updated] = await query<{ xp: number }>(
      `UPDATE user_profiles SET xp = xp + $1 WHERE user_id = $2 RETURNING xp`,
      [awarded, userId],
    );

    return res.status(200).json({ xp: updated?.xp ?? 0, awarded });
  } catch (err: unknown) {
    console.error("[xp]", err instanceof Error ? err.message : err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
