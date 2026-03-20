import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const CACHED: Record<string, Record<string, string>> = {};

export async function GET(req: NextRequest) {
  await auth.protect();
  const country = new URL(req.url).searchParams.get("country") || "Uganda";
  if (CACHED[country]) return NextResponse.json(CACHED[country]);

  if (!process.env.OPENAI_API) {
    return NextResponse.json({
      overview: `${country} is a vibrant East African nation with a rich cultural heritage and diverse traditions.`,
      capital: country === "Uganda" ? "Kampala" : "Capital City",
      currency: country === "Uganda" ? "Ugandan Shilling (UGX)" : "Local Currency",
      language: country === "Uganda" ? "Luganda, English, Swahili" : "Official Languages",
      culture: `${country} has diverse cultural traditions, festivals, and community practices that reflect its history.`,
      phrases: country === "Uganda" ? "Oli otya? (How are you?) • Webale nyo (Thank you) • Wasuze otya? (Good morning)" : "Learn common local phrases to connect with locals.",
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system", content: "You are an expert on African countries. Respond ONLY with valid JSON, no markdown."
        }, {
          role: "user", content: `Provide information about ${country} in JSON: {overview, capital, currency, language, culture, phrases} — phrases should include 3 common local phrases with translations. Keep each field under 200 chars.`
        }],
        temperature: 0.3, max_tokens: 600, response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    let result: Record<string, string> = {};
    try {
      result = JSON.parse(data.choices[0]?.message?.content || "{}");
    } catch {
      console.error("Country explorer: failed to parse OpenAI JSON response");
    }
    CACHED[country] = result;
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ overview: `${country} is a vibrant African nation with rich culture and traditions.` });
  }
}
