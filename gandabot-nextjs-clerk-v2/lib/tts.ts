/**
 * Sunbird AI Text-to-Speech — single source of truth.
 *
 * API docs: https://salt.sunbird.ai/API/
 * Endpoint: POST https://api.sunbird.ai/tasks/tts
 * Auth:     Authorization: Bearer <SUNBIRD_API_KEY>
 *
 * All voice output in GandaBot routes through this module so that
 * speaker IDs, temperature, and retry behaviour are configured once.
 */

// ─── Endpoint ─────────────────────────────────────────────────────────────────

export const SUNBIRD_TTS_URL = "https://api.sunbird.ai/tasks/tts";

// ─── Speaker IDs ──────────────────────────────────────────────────────────────
// Each integer maps a language code (Sunbird/ISO 639-3) to a trained voice.
// Source: https://salt.sunbird.ai/API/ — "Supported Languages & Speaker IDs"

export const SPEAKER_IDS: Record<string, number> = {
  lug: 248, // Luganda    — Female
  ach: 241, // Acholi     — Female
  teo: 242, // Ateso      — Female
  nyn: 243, // Runyankole — Female
  lgg: 245, // Lugbara    — Female
  swh: 246, // Swahili    — Male
};

/**
 * All language codes that Sunbird TTS supports.
 * Used by views to decide whether to show the "Listen" button.
 */
export const SUNBIRD_TTS_SUPPORTED = new Set(Object.keys(SPEAKER_IDS));

// ─── Request / Response types ─────────────────────────────────────────────────

export interface SunbirdTTSRequest {
  text:                  string;  // 1–5000 chars
  speaker_id:            number;
  temperature?:          number;  // 0.0–2.0 (default 0.7)
  max_new_audio_tokens?: number;  // 100–5000 (default 2000)
}

export interface SunbirdTTSOutput {
  audio_url:        string;  // Signed GCS URL — expires ~2 min after generation
  duration_seconds: number;
  blob:             string;  // Cloud storage key (for server-side re-signing if needed)
  sample_rate:      number;  // 16 000 Hz
  format:           string;  // "mp3"
  speaker_id:       number;
  processing_time:  number;
}

export interface SunbirdTTSResponse {
  output: SunbirdTTSOutput;
}

// ─── Our API response shape ───────────────────────────────────────────────────
// What /api/tts returns to the client.

export interface TTSApiResponse {
  audioUrl:        string;
  durationSeconds: number;
  format:          string;  // "mp3"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Look up the Sunbird speaker_id for a language code.
 * Returns null when the language is not supported by Sunbird TTS.
 */
export function getSpeakerId(langCode: string): number | null {
  return SPEAKER_IDS[langCode] ?? null;
}

/**
 * Returns true if Sunbird TTS supports the given language code.
 */
export function isTTSSupported(langCode: string): boolean {
  return SUNBIRD_TTS_SUPPORTED.has(langCode);
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

/**
 * Temperature for language-learning use: slightly below the Sunbird default (0.7)
 * for more consistent, natural-paced pronunciation.
 */
export const TTS_TEMPERATURE = 0.6;

/**
 * Max tokens — default 2000 is ample for phrase-length utterances (≤ ~30 s).
 * Keep the default; only override for very long texts.
 */
export const TTS_MAX_TOKENS = 2000;
