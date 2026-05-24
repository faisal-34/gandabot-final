/**
 * POST /api/tts
 * Body: { text: string; langCode: string }
 *
 * Server-side proxy to Sunbird AI Text-to-Speech.
 * Keeps SUNBIRD_API_KEY off the client bundle entirely.
 *
 * Flow:
 *   1. Validate request (auth, body shape, language support)
 *   2. Look up speaker_id from lib/tts.ts
 *   3. POST to https://api.sunbird.ai/tasks/tts
 *   4. Retry once on 503 (transient Sunbird worker timeout)
 *   5. Return { audioUrl, durationSeconds, format } to the client
 *
 * The signed audioUrl from Sunbird expires in ~2 minutes — clients must
 * start playback immediately. Do NOT cache the URL server-side.
 *
 * Required env var: SUNBIRD_API_KEY (server-side only, no NEXT_PUBLIC_ prefix)
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import {
  SUNBIRD_TTS_URL,
  getSpeakerId,
  isTTSSupported,
  TTS_TEMPERATURE,
  TTS_MAX_TOKENS,
  type SunbirdTTSRequest,
  type SunbirdTTSResponse,
  type TTSApiResponse,
} from "@/lib/tts";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_TEXT_LENGTH = 5_000; // Sunbird hard limit
const RETRY_DELAY_MS  = 800;   // Wait before retrying a 503
const TIMEOUT_MS      = 20_000; // Abort Sunbird call if no response in 20 s

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * Call Sunbird TTS with one automatic retry on 503.
 */
async function callSunbird(body: SunbirdTTSRequest, apiKey: string): Promise<SunbirdTTSResponse> {
  async function attempt(): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      return await fetch(SUNBIRD_TTS_URL, {
        method:  "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type":  "application/json",
          "Accept":        "application/json",
        },
        body:   JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  let res = await attempt();

  // Single retry on transient worker timeout
  if (res.status === 503) {
    await sleep(RETRY_DELAY_MS);
    res = await attempt();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Voice generation error ${res.status}: ${text}`);
  }

  return res.json() as Promise<SunbirdTTSResponse>;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TTSApiResponse | { error: string }>,
) {
  // ── Method guard ─────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ── API key check ─────────────────────────────────────────────────────────
  const apiKey = process.env.SUNBIRD_API_KEY;
  if (!apiKey) {
    console.error("[tts] SUNBIRD_API_KEY is not set");
    return res.status(503).json({ error: "TTS service is not configured" });
  }

  // ── Input validation ──────────────────────────────────────────────────────
  const { text, langCode } = req.body as { text?: string; langCode?: string };

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }
  if (!langCode || typeof langCode !== "string") {
    return res.status(400).json({ error: "langCode is required" });
  }
  if (text.trim().length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: `text must be ${MAX_TEXT_LENGTH} characters or fewer`,
    });
  }
  if (!isTTSSupported(langCode)) {
    return res.status(400).json({
      error: `Language "${langCode}" does not have voice support. Supported: lug, ach, teo, nyn, lgg, swh`,
    });
  }

  const speakerId = getSpeakerId(langCode)!;

  // ── Call Sunbird ──────────────────────────────────────────────────────────
  try {
    const sunbirdRes = await callSunbird(
      {
        text:                 text.trim(),
        speaker_id:           speakerId,
        temperature:          TTS_TEMPERATURE,
        max_new_audio_tokens: TTS_MAX_TOKENS,
      },
      apiKey,
    );

    const { audio_url, duration_seconds, format } = sunbirdRes.output;

    if (!audio_url) {
      throw new Error("Sunbird returned no audio_url");
    }

    return res.status(200).json({
      audioUrl:        audio_url,
      durationSeconds: duration_seconds,
      format:          format ?? "mp3",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tts]", msg);

    // Distinguish timeout from other errors for the client
    if (msg.includes("abort") || msg.includes("timeout")) {
      return res.status(504).json({ error: "TTS request timed out — try again" });
    }
    return res.status(502).json({ error: "TTS generation failed — try again shortly" });
  }
}
