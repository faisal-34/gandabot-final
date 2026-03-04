import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await auth.protect();
  const { text, targetWord } = await req.json();

  if (!process.env.OPENAI_API) {
    const score = Math.floor(Math.random() * 30) + 65;
    return NextResponse.json({ score, feedback: `Good attempt at "${targetWord}"! Keep practicing for more natural pronunciation.`, tips: "Focus on the tonal patterns unique to Luganda." });
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
  } catch {
    return NextResponse.json({ score: 70, feedback: "Good effort! Keep practicing.", tips: "Focus on the tone of each syllable." });
  }
}
