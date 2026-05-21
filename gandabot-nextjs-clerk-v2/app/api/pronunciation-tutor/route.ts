import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = await auth.protect();
  const { allowed, retryAfterMs } = rateLimit(`tutor:${userId}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  const { text, targetWord } = await req.json();

  if (!process.env.OPENAI_API) {
    return NextResponse.json({ error: "Pronunciation scoring unavailable" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system", content: "You are a Luganda pronunciation coach. Respond ONLY with JSON: {score (0-100), feedback (1 sentence), tips (1 actionable tip)}."
        }, {
          role: "user", content: `Target word: "${targetWord}". Student typed: "${text}". Score their pronunciation attempt and give feedback.`
        }],
        temperature: 0.3, max_tokens: 200, response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return NextResponse.json(JSON.parse(data.choices[0]?.message?.content || "{}"));
  } catch (err) {
    console.error("[pronunciation-tutor] error:", err);
    return NextResponse.json({ error: "Scoring service unavailable" }, { status: 502 });
  }
}
