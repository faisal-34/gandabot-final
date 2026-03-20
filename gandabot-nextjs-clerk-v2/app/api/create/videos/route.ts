import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ganda_clips (
      id           SERIAL PRIMARY KEY,
      user_id      TEXT NOT NULL,
      username     TEXT NOT NULL DEFAULT 'GandaUser',
      caption      TEXT,
      category     TEXT DEFAULT 'culture',
      video_url    TEXT NOT NULL,
      audio_url    TEXT,
      thumbnail    TEXT,
      likes        INTEGER NOT NULL DEFAULT 0,
      views        INTEGER NOT NULL DEFAULT 0,
      duration     NUMERIC DEFAULT 0,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS clip_likes (
      clip_id  INTEGER NOT NULL REFERENCES ganda_clips(id) ON DELETE CASCADE,
      user_id  TEXT NOT NULL,
      PRIMARY KEY (clip_id, user_id)
    );
  `);
}

export async function GET(req: NextRequest) {
  await ensureTable();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const userId = searchParams.get("userId");

  let sql = "SELECT id, user_id, username, caption, category, video_url, audio_url, thumbnail, likes, views, duration, created_at FROM ganda_clips WHERE 1=1";
  const params: string[] = [];

  if (category && category !== "all") {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  if (userId) {
    params.push(userId);
    sql += ` AND user_id = $${params.length}`;
  }
  sql += " ORDER BY created_at DESC LIMIT 50";

  const rows = await query(sql, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTable();
  const body = await req.json();
  const { caption, category, videoUrl, audioUrl, thumbnail, duration, username } = body;

  if (!videoUrl) return NextResponse.json({ error: "videoUrl required" }, { status: 400 });

  // Increment views on own post creation is 0, just insert
  const rows = await query(
    `INSERT INTO ganda_clips (user_id, username, caption, category, video_url, audio_url, thumbnail, duration)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [userId, username || "GandaUser", caption || "", category || "culture", videoUrl, audioUrl || null, thumbnail || null, duration || 0]
  );
  return NextResponse.json({ success: true, clip: rows[0] });
}
