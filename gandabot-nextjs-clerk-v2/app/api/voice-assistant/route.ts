import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await auth.protect();
  const { text, action = "translate" } = await req.json();

  if (!process.env.OPENAI_API) {
    return NextResponse.json({ english: text, luganda: "Webale nyo — (Translation requires OpenAI API key)", cultural: "Luganda is a Bantu language spoken by the Baganda people of Uganda." });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system", content: "You are a bilingual Luganda-English translator with deep cultural knowledge. Respond ONLY with JSON: {english, luganda, cultural} where cultural is a brief note about usage or context."
        }, {
          role: "user", content: `Translate and provide cultural context for: "${text}"`
        }],
        temperature: 0.3, max_tokens: 300, response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    return NextResponse.json(JSON.parse(data.choices[0]?.message?.content || "{}"));
  } catch {
    return NextResponse.json({ english: text, luganda: "Translation unavailable", cultural: "Please try again." });
  }
}
