/**
 * GET /api/lessons/progress
 *   Returns the list of completed lesson IDs for the authenticated user.
 *   Response: { completed: number[] }
 *
 * POST /api/lessons/progress
 *   Body: { lesson_id: number }
 *   Marks a lesson as complete (idempotent — double-completion is a no-op).
 *   If newly completed: increments lessons_done + xp in user_profiles table.
 *   Response: { newly_completed: boolean; xp_awarded: number; lessons_done: number }
 *
 * DB tables required:
 *   gandabot_lesson_progress (
 *     id          SERIAL PRIMARY KEY,
 *     user_id     TEXT NOT NULL,
 *     lesson_id   INTEGER NOT NULL,
 *     completed_at TIMESTAMPTZ DEFAULT NOW(),
 *     UNIQUE (user_id, lesson_id)
 *   )
 *
 *   user_profiles (
 *     user_id      TEXT PRIMARY KEY,
 *     lessons_done INTEGER DEFAULT 0,
 *     xp           INTEGER DEFAULT 0,
 *     ...
 *   )
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { LESSONS } from "@/lib/lessons";

const XP_PER_LESSON = 50;

// ─── GET — fetch completed lesson IDs ────────────────────────────────────────

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const rows = await query<{ lesson_id: number }>(
    `SELECT lesson_id FROM gandabot_lesson_progress WHERE user_id = $1 ORDER BY lesson_id ASC`,
    [userId],
  );
  return res.status(200).json({ completed: rows.map((r) => r.lesson_id) });
}

// ─── POST — mark lesson complete ─────────────────────────────────────────────

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string,
) {
  const { lesson_id } = req.body as { lesson_id?: unknown };

  if (typeof lesson_id !== "number" || !Number.isInteger(lesson_id)) {
    return res.status(400).json({ error: "lesson_id must be an integer" });
  }

  const validIds = new Set(LESSONS.map((l) => l.id));
  if (!validIds.has(lesson_id)) {
    return res.status(400).json({ error: `lesson_id ${lesson_id} does not exist` });
  }

  // Ensure profile row exists
  await query(
    `INSERT INTO user_profiles (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );

  // Attempt to insert — ON CONFLICT means already done → no-op
  const inserted = await query<{ id: number }>(
    `INSERT INTO gandabot_lesson_progress (user_id, lesson_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, lesson_id) DO NOTHING
     RETURNING id`,
    [userId, lesson_id],
  );

  const newlyCompleted = inserted.length > 0;

  if (newlyCompleted) {
    // Atomically bump lessons_done and xp in user_profiles
    await query(
      `UPDATE user_profiles
       SET lessons_done = lessons_done + 1,
           xp           = xp + $1
       WHERE user_id = $2`,
      [XP_PER_LESSON, userId],
    );
  }

  // Return current lessons_done count
  const [profile] = await query<{ lessons_done: number }>(
    `SELECT lessons_done FROM user_profiles WHERE user_id = $1`,
    [userId],
  );

  return res.status(200).json({
    newly_completed: newlyCompleted,
    xp_awarded:      newlyCompleted ? XP_PER_LESSON : 0,
    lessons_done:    profile?.lessons_done ?? 0,
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET")  return await handleGet(req, res, userId);
    if (req.method === "POST") return await handlePost(req, res, userId);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: unknown) {
    console.error("[lessons/progress]", err instanceof Error ? err.message : err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
