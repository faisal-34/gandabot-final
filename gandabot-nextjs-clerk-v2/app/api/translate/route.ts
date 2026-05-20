/**
 * Translation API — powered by Sunbird AI
 * POST /api/translate
 *
 * Body: { text, sourceLang?, targetLang? }
 * Response: { original, translated, sourceLang, targetLang, cultural }
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SUNBIRD_LANGUAGES, LANG_NAMES } from "@/lib/sunbird/languages";
import { sunbirdTranslate, sunbirdDetectLanguage } from "@/lib/sunbird/client";

// ─── Cultural context (OpenAI supplement, optional) ──────────────────────────
function getCulturalFallback(langCode: string): string {
  const notes: Record<string, string> = {
    lug: "Luganda is a Bantu language of the Baganda, Uganda's largest ethnic group. Greetings carry deep warmth and respect.",
    ach: "Acholi is a Nilotic language spoken in Northern Uganda with rich oral storytelling traditions.",
    teo: "Ateso is spoken in Eastern Uganda and Kenya by the Iteso people, known for their warm hospitality.",
    lgg: "Lugbara is spoken in the West Nile region of Uganda and DR Congo with a distinctive tonal system.",
    nyn: "Runyankole is spoken in South-Western Uganda. The Ankole people have a rich cattle-herding culture.",
    xog: "Lusoga is spoken in the Busoga region around Jinja, Uganda's second-largest city.",
    myx: "Lumasaba is spoken on the slopes of Mt. Elgon in Eastern Uganda by the Bamasaba people.",
    kin: "Kinyarwanda is an official language of Rwanda and is understood across the Great Lakes region.",
    swa: "Swahili (Kiswahili) is East Africa's lingua franca, spoken across Uganda, Kenya, Tanzania, and beyond.",
    eng: "English is Uganda's official language used in education, government, and formal communication.",
  };
  return notes[langCode] ?? "Uganda is home to over 56 languages across four major language families.";
}

async function getCulturalContext(
  originalText: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const openaiKey = process.env.OPENAI_API;
  if (!openaiKey) return getCulturalFallback(targetLang);

  try {
    const sourceName = LANG_NAMES[sourceLang] ?? sourceLang;
    const targetName = LANG_NAMES[targetLang] ?? targetLang;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Ugandan cultural expert. Give a very brief (1–2 sentences max) cultural note about the phrase — its usage, tone, or cultural significance. Be practical and interesting for language learners. No filler.",
          },
          {
            role: "user",
            content: `Source (${sourceName}): "${originalText}"\nBrief cultural note for someone translating to ${targetName}.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 100,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return getCulturalFallback(targetLang);
    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ??
      getCulturalFallback(targetLang)
    );
  } catch {
    return getCulturalFallback(targetLang);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  await auth.protect();

  const {
    text,
    sourceLang = "auto",
    targetLang = "lug",
  }: { text: string; sourceLang?: string; targetLang?: string } =
    await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  if (!SUNBIRD_LANGUAGES[targetLang]) {
    return NextResponse.json(
      { error: `Unsupported target language: ${targetLang}` },
      { status: 400 }
    );
  }

  // 1. Detect source language if "auto"
  let resolvedSource = sourceLang;
  if (sourceLang === "auto" || !SUNBIRD_LANGUAGES[sourceLang]) {
    try {
      resolvedSource = await sunbirdDetectLanguage(text);
    } catch {
      resolvedSource = "eng";
    }
  }

  // 2. No-op if same language
  if (resolvedSource === targetLang) {
    const cultural = await getCulturalContext(text, resolvedSource, targetLang);
    return NextResponse.json({
      original: text,
      translated: text,
      sourceLang: resolvedSource,
      targetLang,
      cultural,
    });
  }

  // 3. Translate via Sunbird AI
  let translated = "";
  try {
    translated = await sunbirdTranslate(text, resolvedSource, targetLang);
  } catch (err) {
    console.error("[translate] Sunbird error:", err);
    const targetName = LANG_NAMES[targetLang] ?? targetLang;
    return NextResponse.json({
      original: text,
      translated: `[Translation to ${targetName} failed — please try again]`,
      sourceLang: resolvedSource,
      targetLang,
      cultural: getCulturalFallback(targetLang),
      error: err instanceof Error ? err.message : String(err),
    });
  }

  // 4. Cultural context (non-blocking)
  const cultural = await getCulturalContext(text, resolvedSource, targetLang);

  return NextResponse.json({
    original: text,
    translated,
    sourceLang: resolvedSource,
    targetLang,
    cultural,
  });
}
