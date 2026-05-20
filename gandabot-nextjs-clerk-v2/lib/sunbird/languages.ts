/**
 * Sunbird AI supported languages
 * Source: https://docs.sunbird.ai/languages
 *
 * TTS speaker IDs (modal/tts endpoint):
 *   241 = Acholi, 242 = Ateso, 243 = Runyankole,
 *   245 = Lugbara, 246 = Swahili, 248 = Luganda
 */

export interface LangInfo {
  name: string;
  native: string;
  ttsId?: number;      // speaker ID for /tasks/modal/tts (undefined = no TTS)
  hasStt: boolean;     // supported by /tasks/modal/stt
}

export const SUNBIRD_LANGUAGES: Record<string, LangInfo> = {
  // ── Full-featured (Translation + STT + TTS) ───────────────────────────────
  eng: { name: "English",     native: "English",      ttsId: undefined, hasStt: true  }, // TTS via standard voice
  lug: { name: "Luganda",     native: "Luganda",      ttsId: 248,       hasStt: true  },
  ach: { name: "Acholi",      native: "Lwo",          ttsId: 241,       hasStt: true  },
  teo: { name: "Ateso",       native: "Ateso",        ttsId: 242,       hasStt: true  },
  nyn: { name: "Runyankole",  native: "Runyankore",   ttsId: 243,       hasStt: true  },
  lgg: { name: "Lugbara",     native: "Lugbara",      ttsId: 245,       hasStt: true  },
  swa: { name: "Swahili",     native: "Kiswahili",    ttsId: 246,       hasStt: true  },
  // ── Translation + STT (no TTS) ────────────────────────────────────────────
  xog: { name: "Lusoga",      native: "Lusoga",       ttsId: undefined, hasStt: true  },
  kin: { name: "Kinyarwanda", native: "Ikinyarwanda", ttsId: undefined, hasStt: true  },
  myx: { name: "Lumasaba",    native: "Lumasaba",     ttsId: undefined, hasStt: true  },
  // ── Translation only ─────────────────────────────────────────────────────
  laj: { name: "Lango",       native: "Lango",        ttsId: undefined, hasStt: false },
  nyo: { name: "Runyoro",     native: "Runyoro",      ttsId: undefined, hasStt: false },
  cgg: { name: "Rukiga",      native: "Rukiga",       ttsId: undefined, hasStt: false },
};

export type SunbirdLangCode = keyof typeof SUNBIRD_LANGUAGES;

// Quick lookup: code → display name
export const LANG_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(SUNBIRD_LANGUAGES).map(([code, { name }]) => [code, name])
);

// Languages shown in the UI language picker (full-featured ones first)
export const UI_LANGUAGES: SunbirdLangCode[] = [
  "lug", "eng", "ach", "teo", "nyn", "lgg", "swa", "xog", "kin", "myx",
];
