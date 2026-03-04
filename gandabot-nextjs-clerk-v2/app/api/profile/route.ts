import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await query(`CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY, lessons_done INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, last_active TIMESTAMPTZ DEFAULT NOW()
  )`);

  await query(
    "INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET last_active=NOW()",
    [userId]
  );

  const rows = await query<{ lessons_done: number; streak_days: number; xp: number }>(
    "SELECT lessons_done, streak_days, xp FROM user_progress WHERE user_id=$1", [userId]
  );
  return NextResponse.json(rows[0] || { lessons_done: 0, streak_days: 0, xp: 0 });
}
