/**
 * Offline Cache — uses @capacitor/preferences (UserDefaults on iOS, SharedPreferences on Android)
 * Falls back to localStorage in the browser.
 */

import type { TranslationResult } from "./native-types";

const MAX_TRANSLATIONS = 50;
const MAX_MESSAGES = 100;

// Lazy-load Capacitor Preferences to avoid SSR errors
async function getPreferences() {
  if (typeof window === "undefined") return null;
  try {
    const { Preferences } = await import("@capacitor/preferences");
    return Preferences;
  } catch {
    return null;
  }
}

async function store(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.set({ key, value: json });
  } else {
    try { localStorage.setItem(`gb_${key}`, json); } catch { /* quota */ }
  }
}

async function load<T>(key: string): Promise<T | null> {
  const prefs = await getPreferences();
  let json: string | null = null;
  if (prefs) {
    const { value } = await prefs.get({ key });
    json = value;
  } else {
    try { json = localStorage.getItem(`gb_${key}`); } catch { /* blocked */ }
  }
  if (!json) return null;
  try { return JSON.parse(json) as T; } catch { return null; }
}

// ─── Translations ────────────────────────────────────────────────────────────

export async function cacheTranslation(result: TranslationResult): Promise<void> {
  const existing = await getCachedTranslations();
  // Deduplicate by original text + language pair
  const filtered = existing.filter(
    (t) => !(t.original === result.original && t.sourceLang === result.sourceLang && t.targetLang === result.targetLang)
  );
  const updated = [result, ...filtered].slice(0, MAX_TRANSLATIONS);
  await store("translations", updated);
}

export async function getCachedTranslations(): Promise<TranslationResult[]> {
  return (await load<TranslationResult[]>("translations")) ?? [];
}

export async function clearTranslationCache(): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.remove({ key: "translations" });
  } else {
    localStorage.removeItem("gb_translations");
  }
}

// ─── Chat history ─────────────────────────────────────────────────────────────

export interface CachedMessage {
  role: "user" | "assistant";
  content: string;
}

export async function cacheChatMessages(
  language: string,
  messages: CachedMessage[]
): Promise<void> {
  await store(`chat_${language}`, messages.slice(-MAX_MESSAGES));
}

export async function getCachedChatMessages(
  language: string
): Promise<CachedMessage[]> {
  return (await load<CachedMessage[]>(`chat_${language}`)) ?? [];
}

/**
 * Clear cached chat history for a specific language.
 * Useful for "Clear conversation" user action.
 */
export async function clearChatMessages(language: string): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.remove({ key: `chat_${language}` });
  } else {
    try { localStorage.removeItem(`gb_chat_${language}`); } catch { /* blocked */ }
  }
}

/**
 * Clear ALL GandaBot cached data (translations + all chat histories).
 * Useful for a "Reset app data" option in ProfileView.
 */
export async function clearAllCache(): Promise<void> {
  const prefs = await getPreferences();
  if (prefs) {
    await prefs.clear();
  } else {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("gb_"));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch { /* blocked */ }
  }
}

// ─── Network status ───────────────────────────────────────────────────────────

/**
 * Returns whether the device appears to be online.
 * Uses navigator.onLine as the primary signal. Note: onLine can be
 * true even on a captive portal, so treat as a best-effort heuristic.
 */
export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}
