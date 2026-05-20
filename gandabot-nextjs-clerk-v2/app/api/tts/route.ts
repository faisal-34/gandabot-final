/**
 * Text-to-Speech API — powered by Sunbird AI
 * POST /api/tts
 *
 * Body: { text, langCode }
 * Response: { audioUrl, langCode, speakerId, expiresAt }
 *
 * TTS speaker IDs:
 *   lug=248, ach=241, teo=242, nyn=243, lgg=245, swa=246
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { SUNBIRD_LANGUAGES } from "@/lib/sunbird/languages";
import { sunbirdTTS } from "@/lib/sunbird/client";

export async function POST(req: NextRequest) {
  await auth.protect();

  const { text, langCode = "lug" }: { text: string; langCode?: string } =
    await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const langInfo = SUNBIRD_LANGUAGES[langCode];
  if (!langInfo?.ttsId) {
    return NextResponse.json(
      {
        error: `TTS not available for language: ${langCode}. Supported: lug, ach, teo, nyn, lgg, swa`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await sunbirdTTS(text, langInfo.ttsId, "url");
    return NextResponse.json({
      audioUrl: result.url,
      langCode,
      speakerId: langInfo.ttsId,
      expiresAt: result.expiresAt,
      fileName: result.fileName,
    });
  } catch (err) {
    console.error("[tts] Sunbird error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 500 }
    );
  }
}
