/**
 * Sunbird AI API client
 * Base URL: https://api.sunbird.ai
 * Auth: Bearer token from SUNBIRD_API_KEY env var
 */

const BASE_URL = "https://api.sunbird.ai";

function getKey(): string {
  const key = process.env.SUNBIRD_API_KEY;
  if (!key) throw new Error("SUNBIRD_API_KEY environment variable is not set");
  return key;
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getKey()}`,
    "Content-Type": "application/json",
  };
}

// ─── Translation ─────────────────────────────────────────────────────────────
// POST /tasks/translate
// Languages: ach, eng, lgg, lug, nyn, swa, teo, xog, kin, myx, laj, nyo, cgg…
export async function sunbirdTranslate(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const res = await fetch(`${BASE_URL}/tasks/translate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      source_language: sourceLang,
      target_language: targetLang,
      text,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Sunbird translate ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Response: { translated_text: string, ... }
  const translated: string =
    data.translated_text ?? data.translation ?? data.output ?? "";
  if (!translated) throw new Error("Empty translation response");
  return translated;
}

// ─── Language Detection ───────────────────────────────────────────────────────
// POST /tasks/language_id
export async function sunbirdDetectLanguage(text: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/tasks/language_id`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return "eng";

  const data = await res.json();
  // Response: { language: "lug", ... } or { detected_language: "lug" }
  return (
    data.language ??
    data.detected_language ??
    data.lang ??
    "eng"
  );
}

// ─── Text-to-Speech ───────────────────────────────────────────────────────────
// POST /tasks/modal/tts
// speaker_id: 241=Acholi, 242=Ateso, 243=Runyankole, 245=Lugbara, 246=Swahili, 248=Luganda
export async function sunbirdTTS(
  text: string,
  speakerId: number,
  responseMode: "url" | "stream" | "both" = "url"
): Promise<{ url: string; fileName?: string; expiresAt?: string }> {
  const res = await fetch(`${BASE_URL}/tasks/modal/tts`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      text,
      speaker_id: speakerId,
      response_mode: responseMode,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Sunbird TTS ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Response: { audio_url: string, file_name: string, expiration_time: string }
  const url: string =
    data.audio_url ?? data.url ?? data.signed_url ?? "";
  if (!url) throw new Error("No audio URL in TTS response");

  return {
    url,
    fileName: data.file_name,
    expiresAt: data.expiration_time,
  };
}

// ─── Speech-to-Text ───────────────────────────────────────────────────────────
// POST /tasks/modal/stt  (multipart/form-data)
export async function sunbirdSTT(
  audioBlob: Blob,
  fileName: string,
  languageCode?: string
): Promise<string> {
  const form = new FormData();
  form.append("audio", audioBlob, fileName);
  if (languageCode) {
    form.append("language", languageCode);
  }

  const res = await fetch(`${BASE_URL}/tasks/modal/stt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKey()}`,
      // Note: Do NOT set Content-Type for multipart — browser/fetch sets boundary automatically
    },
    body: form,
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Sunbird STT ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Response: { transcription: string, audio_url: string, language: string }
  const transcription: string =
    data.transcription ?? data.text ?? data.transcript ?? "";
  return transcription;
}

// ─── Chat (Sunflower LLM) ─────────────────────────────────────────────────────
// POST /tasks/sunflower_inference
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function sunbirdChat(
  messages: ChatMessage[],
  options?: { temperature?: number; modelType?: string }
): Promise<string> {
  const res = await fetch(`${BASE_URL}/tasks/sunflower_inference`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      messages,
      model_type: options?.modelType ?? "sunflower",
      temperature: options?.temperature ?? 0.7,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Sunbird chat ${res.status}: ${err}`);
  }

  const data = await res.json();
  // Response: { response: string, ... }
  return data.response ?? data.text ?? data.content ?? "";
}

// ─── Simple one-shot inference ─────────────────────────────────────────────
// POST /tasks/sunflower_simple
export async function sunbirdSimple(
  instruction: string,
  systemMessage?: string,
  options?: { temperature?: number }
): Promise<string> {
  const body: Record<string, unknown> = {
    instruction,
    temperature: options?.temperature ?? 0.5,
  };
  if (systemMessage) body.system_message = systemMessage;

  const res = await fetch(`${BASE_URL}/tasks/sunflower_simple`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Sunbird simple ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.response ?? data.text ?? data.content ?? "";
}
