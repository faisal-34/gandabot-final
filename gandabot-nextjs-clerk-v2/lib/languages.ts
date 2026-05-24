/**
 * Shared language definitions used across ChatView, VoiceView, TutorView, etc.
 * Single source of truth — update here and all consumers benefit.
 */

export interface Language {
  code: string;
  label: string;
  /** BCP-47 tag used for Web Speech API / AVSpeechSynthesizer locale hints */
  bcp47: string;
  /** ISO 639-3 code sent to Sunbird AI */
  sunbirdCode: string;
}

export const LANGUAGES: Language[] = [
  { code: "lug", label: "Luganda",    bcp47: "lg",    sunbirdCode: "lug" },
  { code: "ach", label: "Acholi",     bcp47: "ach",   sunbirdCode: "ach" },
  { code: "teo", label: "Ateso",      bcp47: "teo",   sunbirdCode: "teo" },
  { code: "nyn", label: "Runyankole", bcp47: "nyn",   sunbirdCode: "nyn" },
  { code: "lgg", label: "Lugbara",    bcp47: "lgg",   sunbirdCode: "lgg" },
  { code: "swh", label: "Swahili",    bcp47: "sw",    sunbirdCode: "swh" },
];

/**
 * Languages that have Sunbird TTS audio support.
 * All 6 Ugandan/regional languages are supported by Sunbird AI.
 * Speaker IDs: lug=248, ach=241, teo=242, nyn=243, lgg=245, swh=246
 */
export const TTS_SUPPORTED = new Set(["lug", "ach", "teo", "nyn", "lgg", "swh"]);

/** All language codes (for type safety) */
export type LanguageCode = "lug" | "ach" | "teo" | "nyn" | "lgg" | "swh";

/**
 * All 6 languages including English, used in VoiceView where English
 * is a valid source language.
 */
export const TRANSLATION_LANGUAGES: Language[] = [
  { code: "eng", label: "English",    bcp47: "en",    sunbirdCode: "eng" },
  ...LANGUAGES,
];

/** Look up a language record by code. Returns undefined if not found. */
export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code) ??
    TRANSLATION_LANGUAGES.find((l) => l.code === code);
}

/** Convenience: return the display label for a language code */
export function getLanguageLabel(code: string): string {
  return getLanguage(code)?.label ?? code;
}
