/**
 * Speech-to-Text API — powered by Sunbird AI
 * POST /api/stt  (multipart/form-data)
 *
 * Form fields:
 *   audio    — audio file (WAV, MP3, OGG, M4A)
 *   language — optional 3-letter language code (lug, ach, teo, etc.)
 *
 * Response: { transcription, language }
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sunbirdSTT } from "@/lib/sunbird/client";

export async function POST(req: NextRequest) {
  await auth.protect();

  const formData = await req.formData();
  const audioFile = formData.get("audio") as File | null;
  const language = formData.get("language") as string | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  // Max 10 min audio — Sunbird trims longer files
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (audioFile.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Audio file too large (max 50MB)" },
      { status: 400 }
    );
  }

  try {
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    });

    const transcription = await sunbirdSTT(
      audioBlob,
      audioFile.name,
      language ?? undefined
    );

    return NextResponse.json({ transcription, language: language ?? "auto" });
  } catch (err) {
    console.error("[stt] Sunbird error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "STT failed" },
      { status: 500 }
    );
  }
}
