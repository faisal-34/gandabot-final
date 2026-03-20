import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "username required" }, { status: 400 });
  }

  const cleaned = username.trim().replace(/\s+/g, "_").slice(0, 32);
  if (cleaned.length < 2) {
    return NextResponse.json({ error: "Username must be at least 2 characters" }, { status: 400 });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return NextResponse.json({ error: "Username can only contain letters, numbers, and underscores" }, { status: 400 });
  }

  // Ensure user_progress table exists
  await query(`CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY, username TEXT, lessons_done INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0, xp INTEGER DEFAULT 0, last_active TIMESTAMPTZ DEFAULT NOW()
  )`);

  // Add username column if it doesn't exist yet (handles existing tables)
  try {
    await query(`ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS username TEXT`);
  } catch { /* ignore */ }

  await query(
    `INSERT INTO user_progress (user_id, username, last_active)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET username = $2, last_active = NOW()`,
    [userId, cleaned]
  );

  // Also update all their clips
  try {
    await query("UPDATE ganda_clips SET username = $1 WHERE user_id = $2", [cleaned, userId]);
  } catch { /* clips table may not exist yet */ }

  return NextResponse.json({ success: true, username: cleaned });
}
