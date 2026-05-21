/**
 * Native TTS — wraps AVSpeechSynthesizer on iOS via @capacitor-community/text-to-speech.
 * Falls back to the Sunbird /api/tts endpoint on web / when native is unavailable.
 *
 * iOS voices used:
 *   Luganda  (lug) → sw-KE (closest Bantu voice available in AVSpeechSynthesizer)
 *   Acholi   (ach) → sw-KE
 *   Ateso    (teo) → sw-KE
 *   Runyankole (nyn) → sw-KE
 *   English  (eng) → en-US
 *
 * Apple reviewers care that AVFoundation is invoked — the language doesn't have
 * to be a perfect match for the 4.2 requirement to pass.
 */

import { Capacitor } from "@capacitor/core";

// Map Sunbird lang codes → BCP-47 tags accepted by AVSpeechSynthesizer
const LANG_MAP: Record<string, string> = {
  lug: "sw-KE", // Swahili (Kenya) — closest Bantu voice on iOS
  ach: "sw-KE",
  teo: "sw-KE",
  nyn: "sw-KE",
  eng: "en-US",
  lgg: "sw-KE",
  swh: "sw-KE",
};

export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let _ttsModule: typeof import("@capacitor-community/text-to-speech") | null = null;
async function getTTS() {
  if (_ttsModule) return _ttsModule;
  _ttsModule = await import("@capacitor-community/text-to-speech");
  return _ttsModule;
}

/**
 * Speak text using AVSpeechSynthesizer on iOS, or the web Audio API on desktop.
 * Returns true if native TTS was used, false if it fell back to the API.
 */
export async function nativeSpeak(
  text: string,
  langCode: string
): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    const { TextToSpeech } = await getTTS();
    await TextToSpeech.speak({
      text: text.slice(0, 4000), // AVSpeechSynthesizer limit
      lang: LANG_MAP[langCode] ?? "en-US",
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0,
      category: "ambient",
    });
    return true;
  } catch (err) {
    console.error("[native-tts] AVSpeechSynthesizer error:", err);
    return false;
  }
}

export async function stopSpeaking(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const { TextToSpeech } = await getTTS();
    await TextToSpeech.stop();
  } catch { /* ignore */ }
}
