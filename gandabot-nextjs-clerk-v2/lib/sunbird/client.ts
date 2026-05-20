/**
 * Sunbird AI client
 * Docs: https://api.sunbird.ai
 * Supports: translation (NLLB), TTS, STT, Sunflower LLM chat
 */

const BASE = "https://api.sunbird.ai";

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SUNBIRD_API_KEY}`,
  };
}

// ─── Translation ──────────────────────────────────────────────────────────────

export async function sunbirdTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/tasks/nllb_translate`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ source_language: sourceLang, target_language: targetLang, text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Handle multiple possible response shapes
    return (
      data?.output?.translated_text ??
      data?.translated_text ??
      data?.output?.text ??
      data?.text ??
      null
    );
  } catch {
    return null;
  }
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

export async function sunbirdTTS(
  text: string,
  language = "lug",
  speakerId = 248
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/tasks/tts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ text, language, speaker_id: speakerId }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = await res.json();

    // audio as base64 string → data URL
    const audio =
      data?.output?.audio ??
      data?.audio ??
      data?.output?.audio_content ??
      data?.audio_content ??
      null;

    if (!audio) return null;

    // Already a URL or data URL
    if (typeof audio === "string" && (audio.startsWith("http") || audio.startsWith("data:"))) {
      return audio;
    }

    // Base64 → data URL (WAV default)
    const mime = data?.output?.mime_type ?? data?.mime_type ?? "audio/wav";
    return `data:${mime};base64,${audio}`;
  } catch {
    return null;
  }
}

// ─── Chat (Sunflower LLM) ─────────────────────────────────────────────────────

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function sunbirdChat(
  messages: ChatMessage[],
  opts: { temperature?: number; max_tokens?: number } = {}
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/tasks/chat`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.max_tokens ?? 500,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (
      data?.output?.response ??
      data?.output?.message?.content ??
      data?.response ??
      data?.choices?.[0]?.message?.content ??
      null
    );
  } catch {
    return null;
  }
}
