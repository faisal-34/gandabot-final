import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS podcasts (
    id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT, language TEXT DEFAULT 'luganda',
    category TEXT DEFAULT 'conversation', topic TEXT, script TEXT, audio_url TEXT, duration TEXT,
    listens INTEGER DEFAULT 0, is_ai_generated BOOLEAN DEFAULT TRUE, ai_insights TEXT,
    created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
}

export async function GET(req: NextRequest) {
  await ensureTable();
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("language");
  let sql = "SELECT * FROM podcasts WHERE 1=1";
  const p: string[] = [];
  if (lang && lang !== "all") { p.push(lang); sql += ` AND language=$${p.length}`; }
  sql += " ORDER BY created_at DESC LIMIT 50";
  return NextResponse.json(await query(sql, p));
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await ensureTable();
  const body = await req.json();
  const rows = await query(
    "INSERT INTO podcasts (title,description,language,category,topic,script,audio_url,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [body.title, body.description, body.language || "luganda", body.category || "conversation", body.topic, body.script, body.audioUrl, userId]
  );
  return NextResponse.json({ success: true, podcast: rows[0] });
}
