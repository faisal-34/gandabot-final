/**
 * Voice Assistant / Translation API
 * Primary: Sunbird NLLB translation + OpenAI cultural context
 * Fallback: OpenAI full translation
 * Returns: { original, translated, sourceLang, targetLang, cultural }
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sunbirdTranslate } from "@/lib/sunbird/client";

async function getCulturalContext(text: string, sourceLang: string): Promise<string> {
  if (!process.env.OPENAI_API) return "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Ugandan cultural expert. Given a phrase and its source language, return ONE concise sentence of cultural context (usage, etiquette, or significance). No more than 20 words. No JSON.",
          },
          {
            role: "user",
            content: `Phrase: "${text}" | Language: ${sourceLang === "lug" ? "Luganda" : "English"}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 60,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  await auth.protect();

  const { text, sourceLang = "eng", targetLang = "lug" } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  // 1. Try Sunbird translation
  if (process.env.SUNBIRD_API_KEY) {
    try {
      const translated = await sunbirdTranslate(text.trim(), sourceLang, targetLang);
      if (translated) {
        const cultural = await getCulturalContext(text.trim(), sourceLang);
        return NextResponse.json({
          original: text.trim(),
          translated,
          sourceLang,
          targetLang,
          cultural,
          // legacy compat
          english: sourceLang === "eng" ? text.trim() : translated,
          luganda: sourceLang === "lug" ? text.trim() : translated,
        });
      }
    } catch (err) {
      console.error("[voice-assistant] Sunbird error:", err);
    }
  }

  // 2. Fallback: OpenAI full translation + cultural context
  if (process.env.OPENAI_API) {
    try {
      const isEnToLg = sourceLang === "eng";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                'You are a bilingual Luganda-English translator with deep cultural knowledge. Respond ONLY with JSON: {"translated": "...", "cultural": "one sentence about cultural context or usage"}',
            },
            {
              role: "user",
              content: `Translate this ${isEnToLg ? "English to Luganda" : "Luganda to English"}: "${text.trim()}"`,
            },
          ],
          temperature: 0.3,
          max_tokens: 200,
          response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
        if (parsed.translated) {
          return NextResponse.json({
            original: text.trim(),
            translated: parsed.translated,
            sourceLang,
            targetLang,
            cultural: parsed.cultural ?? "",
            english: isEnToLg ? text.trim() : parsed.translated,
            luganda: isEnToLg ? parsed.translated : text.trim(),
          });
        }
      }
    } catch (err) {
      console.error("[voice-assistant] OpenAI fallback error:", err);
    }
  }

  // 3. Static fallback
  return NextResponse.json({
    original: text.trim(),
    translated: "Translation unavailable — please try again shortly.",
    sourceLang,
    targetLang,
    cultural: "Luganda is a Bantu language spoken by the Baganda people of Uganda.",
    english: sourceLang === "eng" ? text.trim() : "",
    luganda: sourceLang === "lug" ? text.trim() : "",
  });
}
