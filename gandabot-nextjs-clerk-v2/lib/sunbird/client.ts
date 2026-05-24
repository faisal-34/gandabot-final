/**
 * Sunbird AI client
 * Docs: https://api.sunbird.ai
 * Supports: translation (NLLB), TTS, STT, Sunflower LLM chat
 */

const BASE = "https://api.sunbird.ai";

function headers(): HeadersInit {
  const key = process.env.SUNBIRD_API_KEY;
  if (!key) {
    // Surface misconfiguration loudly in server logs, not silently to users
    console.error("[sunbird] SUNBIRD_API_KEY is not set");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key ?? ""}`,
  };
}

/**
 * Exponential-backoff retry helper.
 * Retries on 429 (rate-limit) and 5xx (server error) only.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 2,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);

      // Retry on rate-limit or transient server errors
      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        // Respect Retry-After if present (in seconds)
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "0", 10);
        const delay = retryAfter > 0 ? retryAfter * 1000 : Math.min(300 * 2 ** attempt, 3000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      // Only retry on network-level errors (AbortError is intentional — don't retry)
      if (err instanceof Error && err.name === "AbortError") throw err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
      }
    }
  }

  throw lastError ?? new Error("fetch failed after retries");
}

// ─── Translation ──────────────────────────────────────────────────────────────

export async function sunbirdTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string | null> {
  if (!text.trim()) return null;

  try {
    const res = await fetchWithRetry(
      `${BASE}/tasks/nllb_translate`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ source_language: sourceLang, target_language: targetLang, text }),
        signal: AbortSignal.timeout(15_000),
      },
    );

    if (!res.ok) {
      console.error(`[sunbird/translate] HTTP ${res.status} for ${sourceLang}→${targetLang}`);
      return null;
    }

    const data = await res.json();
    // Handle multiple possible response shapes across API versions
    const translated =
      data?.output?.translated_text ??
      data?.translated_text ??
      data?.output?.text ??
      data?.text ??
      null;

    if (!translated) {
      console.error("[sunbird/translate] Unexpected response shape:", JSON.stringify(data).slice(0, 200));
    }

    return translated;
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.error("[sunbird/translate] Network error:", err.message);
    }
    return null;
  }
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────

/**
 * Sunbird speaker IDs for each language.
 * These are the clearest-sounding voices verified on the Sunbird platform.
 */
const SPEAKER_IDS: Record<string, number> = {
  lug: 248,
  ach: 150,
  teo: 300,
  nyn: 200,
};

export async function sunbirdTTS(
  text: string,
  language = "lug",
  speakerId?: number,
): Promise<string | null> {
  if (!text.trim()) return null;

  const sid = speakerId ?? SPEAKER_IDS[language] ?? 248;

  try {
    const res = await fetchWithRetry(
      `${BASE}/tasks/tts`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text, language, speaker_id: sid }),
        signal: AbortSignal.timeout(20_000),
      },
    );

    if (!res.ok) {
      console.error(`[sunbird/tts] HTTP ${res.status} for lang=${language}`);
      return null;
    }

    const data = await res.json();

    // audio as base64 string → data URL
    const audio =
      data?.output?.audio ??
      data?.audio ??
      data?.output?.audio_content ??
      data?.audio_content ??
      null;

    if (!audio) {
      console.error("[sunbird/tts] No audio in response:", JSON.stringify(data).slice(0, 200));
      return null;
    }

    // Already a URL or data URL — return as-is
    if (typeof audio === "string" && (audio.startsWith("http") || audio.startsWith("data:"))) {
      return audio;
    }

    // Base64 → data URL (WAV is the default Sunbird encoding)
    const mime = data?.output?.mime_type ?? data?.mime_type ?? "audio/wav";
    return `data:${mime};base64,${audio}`;
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.error("[sunbird/tts] Network error:", err.message);
    }
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
  opts: { temperature?: number; max_tokens?: number } = {},
): Promise<string | null> {
  if (messages.length === 0) return null;

  try {
    const res = await fetchWithRetry(
      `${BASE}/tasks/chat`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          messages,
          temperature: opts.temperature ?? 0.7,
          max_tokens: opts.max_tokens ?? 500,
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );

    if (!res.ok) {
      console.error(`[sunbird/chat] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    const reply =
      data?.output?.response ??
      data?.output?.message?.content ??
      data?.response ??
      data?.choices?.[0]?.message?.content ??
      null;

    if (!reply) {
      console.error("[sunbird/chat] Unexpected response shape:", JSON.stringify(data).slice(0, 200));
    }

    return reply;
  } catch (err) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.error("[sunbird/chat] Network error:", err.message);
    }
    return null;
  }
}
