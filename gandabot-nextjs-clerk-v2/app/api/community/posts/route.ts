import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'general',
      author_id   TEXT NOT NULL,
      author_name TEXT NOT NULL DEFAULT 'Anonymous',
      ai_insights TEXT,
      likes       INTEGER NOT NULL DEFAULT 0,
      reply_count INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS post_votes (
      post_id   INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
      user_id   TEXT NOT NULL,
      vote_type TEXT NOT NULL CHECK (vote_type IN ('up','down')),
      PRIMARY KEY (post_id, user_id)
    );
  `);
}

export async function GET(req: NextRequest) {
  await ensureTables();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let sql = "SELECT id, title, content, category, author_name, likes, reply_count, ai_insights, created_at FROM community_posts WHERE 1=1";
  const params: string[] = [];

  if (category && category !== "all") { params.push(category); sql += ` AND category = $${params.length}`; }
  if (search) { params.push(`%${search.toLowerCase()}%`); sql += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(content) LIKE $${params.length})`; }
  sql += " ORDER BY created_at DESC LIMIT 50";

  const rows = await query(sql, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureTables();
  const { title, content, category, authorName } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

  let aiInsights: string | null = null;
  if (process.env.OPENAI_API && ["culture","pronunciation","grammar"].includes(category)) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: `Give one helpful ${category} insight in under 120 chars for: "${content}"` }], max_tokens: 80 }),
        signal: AbortSignal.timeout(8000),
      });
      const d = await r.json();
      aiInsights = d.choices?.[0]?.message?.content || null;
    } catch { /* skip */ }
  }

  const rows = await query(
    "INSERT INTO community_posts (title, content, category, author_id, author_name, ai_insights) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [title.trim(), content.trim(), category || "general", userId, authorName || "Anonymous", aiInsights]
  );
  return NextResponse.json({ success: true, post: rows[0] });
}
