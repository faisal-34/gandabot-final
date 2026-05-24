/**
 * @deprecated
 *
 * Native TTS via AVSpeechSynthesizer is no longer used.
 * All voice output now routes through Sunbird AI (/api/tts).
 *
 * Stubs are kept here so that any remaining import references compile
 * without errors. Safe to delete once all imports are cleaned up.
 */

export function isNativePlatform(): boolean {
  return false;
}

/** No-op — replaced by Sunbird TTS */
export async function nativeSpeak(_text: string, _langCode: string): Promise<boolean> {
  return false;
}

/** No-op */
export async function stopSpeaking(): Promise<void> {
  // nothing
}

/** @deprecated Use SPEAKER_IDS from lib/tts.ts instead */
export function nativeLangTag(_langCode: string): string {
  return "en-US";
}
