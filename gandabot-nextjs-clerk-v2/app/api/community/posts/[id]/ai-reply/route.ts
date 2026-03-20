import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const FALLBACKS: Record<string, string> = {
  pronunciation: "Try recording yourself and comparing to native speakers — focus on one sound at a time! Webale nyo for sharing.",
  culture: "Learning 'Oli otya?' (How are you?) shows real respect. Locals truly appreciate the effort!",
  grammar: "Start with Bantu similarities to build confidence, then tackle differences gradually. Progress takes time!",
  practice: "Set specific goals and embrace mistakes — that's how fluency is built. Mukama akuume!",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const rows = await query("SELECT title, content, category FROM community_posts WHERE id=$1", [parseInt(id)]);
  if (!rows.length) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = rows[0] as { title: string; content: string; category: string };

  if (!process.env.OPENAI_API) return NextResponse.json({ suggestion: FALLBACKS[post.category] || "Great question! The community is here to help." });

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [
        { role: "system", content: "You are a helpful Luganda learning community member. Keep replies to 2-3 sentences. Include Luganda phrases with translations when helpful." },
        { role: "user", content: `Write a supportive ${post.category} reply to: "${post.title}" — "${post.content}"` },
      ], max_tokens: 150, temperature: 0.7 }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return NextResponse.json({ suggestion: data.choices[0]?.message?.content || FALLBACKS[post.category] });
  } catch {
    return NextResponse.json({ suggestion: FALLBACKS[post.category] || "The community is here to support your Luganda journey!" });
  }
}
