/**
 * Siri Shortcuts — donates NSUserActivity intents so iOS can suggest
 * "Hey Siri, translate with GandaBot" and similar shortcuts.
 *
 * How it works:
 *   1. On each translate / chat action we call donateIntent()
 *   2. iOS learns the pattern and starts suggesting the shortcut
 *   3. Users can also manually add it via Settings → Siri & Search → GandaBot
 *
 * Native requirement (Xcode):
 *   - Add NSUserActivityTypes array to Info.plist with the activity identifiers below
 *   - Enable "Siri" capability in the Xcode project signing
 *
 * Info.plist entry (add inside the root <dict>):
 * <key>NSUserActivityTypes</key>
 * <array>
 *   <string>com.gandabot.app.translate</string>
 *   <string>com.gandabot.app.chat</string>
 *   <string>com.gandabot.app.pronounce</string>
 * </array>
 */

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export const ACTIVITY_TYPES = {
  TRANSLATE: "com.gandabot.app.translate",
  CHAT: "com.gandabot.app.chat",
  PRONOUNCE: "com.gandabot.app.pronounce",
} as const;

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
}

/**
 * Donate a Siri Shortcut intent for a translation action.
 * Call this after every successful translation.
 */
export async function donateTranslateIntent(params: {
  sourceLang: string;
  targetLang: string;
  phrase: string;
}): Promise<void> {
  if (!isIOS()) return;
  try {
    // Capacitor App plugin supports addListener for URL open events.
    // We use the deep-link approach: gandabot://translate?from=eng&to=lug
    // This is picked up by iOS Shortcuts app automatically.
    await App.addListener("appUrlOpen", () => {}); // ensure listener registered
    console.info(
      `[siri] Donating translate intent: ${params.sourceLang} → ${params.targetLang}`
    );
    // The actual NSUserActivity donation happens in the native layer.
    // We post a custom event that the Swift AppDelegate can observe:
    const event = new CustomEvent("gandabot:donate-intent", {
      detail: {
        type: ACTIVITY_TYPES.TRANSLATE,
        title: `Translate ${params.phrase.slice(0, 30)} to ${params.targetLang}`,
        userInfo: params,
      },
    });
    window.dispatchEvent(event);
  } catch (err) {
    console.error("[siri] donateTranslateIntent error:", err);
  }
}

export async function donateChatIntent(language: string): Promise<void> {
  if (!isIOS()) return;
  try {
    const event = new CustomEvent("gandabot:donate-intent", {
      detail: {
        type: ACTIVITY_TYPES.CHAT,
        title: `Chat with GandaBot in ${language}`,
        userInfo: { language },
      },
    });
    window.dispatchEvent(event);
  } catch { /* non-fatal */ }
}

/**
 * Listen for deep-links opened via Siri.
 * e.g. gandabot://translate?from=eng&to=lug&text=hello
 */
export function initSiriLinkHandler(
  onTranslate: (from: string, to: string, text: string) => void
) {
  if (!isIOS()) return;
  try {
    App.addListener("appUrlOpen", ({ url }: { url: string }) => {
      const parsed = new URL(url);
      if (parsed.hostname === "translate") {
        const from = parsed.searchParams.get("from") ?? "eng";
        const to = parsed.searchParams.get("to") ?? "lug";
        const text = parsed.searchParams.get("text") ?? "";
        onTranslate(from, to, text);
      }
    });
  } catch { /* non-fatal */ }
}
