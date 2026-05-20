/**
 * Voice Assistant / Translation API
 * Wraps the Sunbird translation endpoint for the VoiceView UI.
 * Returns {english, luganda, cultural} for backward compatibility,
 * plus extended fields when targetLang is specified.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SUNBIRD_LANGUAGES } from "@/lib/sunbird/languages";

export async function POST(req: NextRequest) {
  await auth.protect();

  const {
    text,
    action = "translate",
    sourceLang = "auto",
    targetLang = "lug",
  }: {
    text: string;
    action?: string;
    sourceLang?: string;
    targetLang?: string;
  } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({
      english: "",
      luganda: "",
      cultural: "Please enter some text to translate.",
    });
  }

  try {
    // Call the dedicated Sunbird translate endpoint internally
    const origin = req.nextUrl.origin;
    const translateRes = await fetch(`${origin}/api/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward auth cookie so auth.protect() passes
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });

    if (!translateRes.ok) {
      throw new Error(`Translate API returned ${translateRes.status}`);
    }

    const result = await translateRes.json();

    // Build backward-compatible response
    // english = the English side of the translation pair
    // luganda = the target-language side (or Luganda specifically)
    const isSourceEnglish = result.sourceLang === "eng";
    const isTargetEnglish = result.targetLang === "eng";

    let english = "";
    let targetText = "";

    if (isSourceEnglish) {
      english = result.original;
      targetText = result.translated;
    } else if (isTargetEnglish) {
      english = result.translated;
      targetText = result.original;
    } else {
      // Neither side is English — provide the original and translation
      english = result.original;
      targetText = result.translated;
    }

    const targetLangName =
      SUNBIRD_LANGUAGES[result.targetLang]?.name || result.targetLang;

    return NextResponse.json({
      // Legacy fields (VoiceView.tsx reads these)
      english,
      luganda: targetText,
      cultural: result.cultural,
      // Extended fields for enhanced UI
      sourceLang: result.sourceLang,
      targetLang: result.targetLang,
      targetLangName,
      original: result.original,
      translated: result.translated,
    });
  } catch (err) {
    console.error("[voice-assistant] error:", err);
    return NextResponse.json({
      english: text,
      luganda: "Translation unavailable — please try again.",
      cultural: "Uganda is home to over 56 languages. Add FEATHERLESS_API_KEY to enable Sunbird AI translation.",
    });
  }
}
