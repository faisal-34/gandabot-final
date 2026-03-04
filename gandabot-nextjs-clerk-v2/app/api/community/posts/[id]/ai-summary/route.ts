import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await auth.protect();
  const { id } = await params;
  const rows = await query("SELECT title, content, reply_count FROM community_posts WHERE id=$1", [parseInt(id)]);
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = rows[0] as { title: string; content: string; reply_count: number };
  if (!process.env.OPENAI_API) return NextResponse.json({ summary: `Discussion on "${post.title}" with ${post.reply_count} replies.` });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [
        { role: "system", content: "Summarize Luganda learning posts in 2-3 encouraging sentences." },
        { role: "user", content: `Summarize: "${post.title}" — "${post.content}"` },
      ], max_tokens: 150, temperature: 0.3 }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return NextResponse.json({ summary: data.choices[0]?.message?.content || `Summary of "${post.title}".` });
  } catch {
    return NextResponse.json({ summary: `Community discussion on "${post.title}" with ${post.reply_count} replies.` });
  }
}
