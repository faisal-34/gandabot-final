/**
 * Text-to-Speech API
 * Primary: Sunbird TTS (Luganda speaker ID 248)
 * Returns: { audioUrl } as base64 data URL or direct URL
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sunbirdTTS } from "@/lib/sunbird/client";

// Luganda speaker IDs available on Sunbird
const SPEAKER_IDS: Record<string, number> = {
  lug: 248,
  ach: 180,
  teo: 185,
  nyn: 183,
};

export async function POST(req: NextRequest) {
  await auth.protect();

  const { text, langCode = "lug" } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  if (!process.env.SUNBIRD_API_KEY) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const speakerId = SPEAKER_IDS[langCode] ?? SPEAKER_IDS.lug;

  try {
    const audioUrl = await sunbirdTTS(text.trim(), langCode, speakerId);
    if (!audioUrl) {
      return NextResponse.json({ error: "TTS generation failed" }, { status: 502 });
    }
    return NextResponse.json({ audioUrl });
  } catch (err) {
    console.error("[tts] error:", err);
    return NextResponse.json({ error: "TTS service unavailable" }, { status: 502 });
  }
}
