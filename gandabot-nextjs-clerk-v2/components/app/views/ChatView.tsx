"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cacheChatMessages, getCachedChatMessages, clearChatMessages, isOnline } from "@/lib/offline-cache";
import { donateChatIntent } from "@/lib/siri-shortcuts";
import type { TTSApiResponse } from "@/lib/tts";
import { LANGUAGES, TTS_SUPPORTED } from "@/lib/languages";
import { MarkdownMessage } from "@/components/app/MarkdownMessage";
import { awardXP } from "@/lib/xp";
import { useXPToast, XPToastContainer } from "@/components/app/XPToast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED: Record<string, string[]> = {
  lug: ["How do I say 'good morning' in Luganda?", "Teach me numbers 1-10", "What is the Baganda culture?", "How do tones work in Luganda?"],
  ach: ["How do I say 'thank you' in Acholi?", "Teach me Acholi greetings", "What is Acholi culture?", "Common Acholi phrases"],
  teo: ["How do I say 'welcome' in Ateso?", "Teach me Ateso numbers", "What is Iteso culture?", "Basic Ateso phrases"],
  nyn: ["How do I say 'hello' in Runyankole?", "Teach me Runyankole greetings", "What is Ankole culture?", "Common Runyankole words"],
  lgg: ["How do I say 'good evening' in Lugbara?", "Teach me Lugbara greetings", "What is Lugbara culture?", "Basic Lugbara phrases"],
  swh: ["How do I say 'how are you' in Swahili?", "Teach me Swahili greetings", "Common Swahili phrases", "Swahili numbers 1-10"],
};

const WELCOME: Record<string, string> = {
  lug: "Nkusubiriza — Welcome! I'm GandaBot, your AI guide to Luganda and Ugandan culture. Ask me anything — vocabulary, grammar, pronunciation, or culture. Tugende! 🇺🇬",
  ach: "Imaro — Welcome! I'm GandaBot, your guide to Acholi language and culture. Ask me about vocabulary, phrases, or traditions. Let's learn together! 🇺🇬",
  teo: "Ejok — Welcome! I'm GandaBot, your guide to Ateso language and Iteso culture. Ask me anything about vocabulary, phrases, or customs. Let's begin! 🇺🇬",
  nyn: "Agandi — Welcome! I'm GandaBot, your guide to Runyankole language and Ankole culture. Ask me about vocabulary, greetings, or traditions. Tugaruke! 🇺🇬",
  lgg: "Nzia — Welcome! I'm GandaBot, your guide to Lugbara language and culture. Ask me about vocabulary, phrases, or customs. Let's explore! 🇺🇬",
  swh: "Karibu — Welcome! I'm GandaBot, your guide to Swahili and East African culture. Ask me about vocabulary, grammar, or culture. Twende! 🌍",
};

const OFFLINE_REPLIES: Record<string, string> = {
  lug: "Nkwetaaga — You're offline! Here's what I know from memory: 'Oli otya?' means 'How are you?' and 'Webale nyo' means 'Thank you very much'. Reconnect for full AI responses.",
  ach: "You're offline! Here's an Acholi phrase: 'Apwoyo' means 'Thank you'. Reconnect for full AI responses.",
  teo: "You're offline! Here's an Ateso phrase: 'Ejok' means 'Good'. Reconnect for full AI responses.",
  nyn: "You're offline! Here's a Runyankole phrase: 'Agandi' means 'Hello'. Reconnect for full AI responses.",
  lgg: "You're offline! Here's a Lugbara phrase: 'Nzia' means 'Good'. Reconnect for full AI responses.",
  swh: "You're offline! Here's a Swahili phrase: 'Habari' means 'How are you?'. Reconnect for full AI responses.",
};

const DEFAULT_LANG = "lug";
const LAST_LANG_KEY = "gandabot_last_language";

/** Persist last-used language to localStorage (works on web + native fallback) */
function saveLastLanguage(code: string) {
  try { localStorage.setItem(LAST_LANG_KEY, code); } catch { /* quota exceeded */ }
}

function readLastLanguage(): string {
  try { return localStorage.getItem(LAST_LANG_KEY) ?? DEFAULT_LANG; } catch { return DEFAULT_LANG; }
}

export function ChatView() {
  const [language, setLanguage] = useState<string>(DEFAULT_LANG);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME[DEFAULT_LANG] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsLoadingIdx, setTtsLoadingIdx] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toasts, showXP } = useXPToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // On mount: restore last language + its cached conversation
  useEffect(() => {
    setOffline(!isOnline());

    const lastLang = readLastLanguage();
    setLanguage(lastLang);

    getCachedChatMessages(lastLang).then((cached) => {
      if (cached.length > 1) {
        setMessages(cached);
      } else {
        setMessages([{ role: "assistant", content: WELCOME[lastLang] ?? WELCOME[DEFAULT_LANG] }]);
      }
    });

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      // Clean up any in-flight request
      abortRef.current?.abort();
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const switchLanguage = useCallback(async (lang: string) => {
    // Cancel any in-flight API request
    abortRef.current?.abort();

    setLanguage(lang);
    setInput("");
    setLoading(false);
    saveLastLanguage(lang);

    // Restore cached history for this language, or show welcome message
    const cached = await getCachedChatMessages(lang);
    if (cached.length > 1) {
      setMessages(cached);
    } else {
      setMessages([{ role: "assistant", content: WELCOME[lang] ?? WELCOME[DEFAULT_LANG] }]);
    }

    // Donate Siri shortcut for this language
    const label = LANGUAGES.find((l) => l.code === lang)?.label ?? lang;
    await donateChatIntent(label);
  }, []);

  const send = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);

    // Offline mode — serve a pre-written cached reply
    if (!isOnline()) {
      const offlineReply = OFFLINE_REPLIES[language] ?? OFFLINE_REPLIES[DEFAULT_LANG];
      const withReply: Message[] = [...newMessages, { role: "assistant", content: offlineReply }];
      setMessages(withReply);
      await cacheChatMessages(language, withReply);
      setLoading(false);
      return;
    }

    // Create a new AbortController for this request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/gandabot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language: langLabel }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      const withReply: Message[] = [
        ...newMessages,
        { role: "assistant", content: data.reply || "Bambi — something went wrong. Please try again." },
      ];
      setMessages(withReply);
      await cacheChatMessages(language, withReply);
      // Award XP for receiving an AI reply (fire-and-forget; show toast)
      showXP(await awardXP("chat_reply"));
    } catch (err: unknown) {
      // AbortError means the user switched language or unmounted — don't show error
      if (err instanceof Error && err.name === "AbortError") return;

      const withError: Message[] = [
        ...newMessages,
        { role: "assistant", content: "Nkwetaaga okugenda briefly — please try again!" },
      ];
      setMessages(withError);
      await cacheChatMessages(language, withError);
    } finally {
      setLoading(false);
    }
  }, [input, language, loading, messages]);

  const playTTS = useCallback(async (text: string, idx: number) => {
    // Only attempt TTS for languages with GandaBot voice support
    if (!TTS_SUPPORTED.has(language)) return;

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setTtsLoadingIdx(idx);

    try {
      const res = await fetch("/api/tts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text, langCode: language }),
      });
      const data: TTSApiResponse & { error?: string } = await res.json();

      if (!res.ok || !data.audioUrl) {
        throw new Error(data.error ?? "TTS failed");
      }

      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => { audioRef.current = null; };
    } catch {
      // TTS is an enhancement — fail silently in chat
    } finally {
      setTtsLoadingIdx(null);
    }
  }, [language]);

  const suggested = SUGGESTED[language] ?? SUGGESTED[DEFAULT_LANG];
  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";
  const hasTTS = TTS_SUPPORTED.has(language);

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          G
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--cream)" }}>GandaBot</div>
          <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>GandaBot AI Language Tutor</div>
        </div>
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* Clear conversation — opens confirmation dialog */}
          {messages.length > 1 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs opacity-30 hover:opacity-70 transition-opacity"
              style={{ color: "var(--cream)" }}
              title="Clear conversation"
              aria-label="Clear conversation history"
            >
              ✕ Clear
            </button>
          )}
          {offline ? (
            <span
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ color: "var(--orange)", borderColor: "var(--orange)", background: "rgba(244,123,32,0.08)" }}
            >
              Offline
            </span>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs opacity-50 hidden sm:block" style={{ color: "var(--cream)" }}>Online</span>
            </>
          )}
        </div>
      </div>

      {/* Language picker */}
      <div className="shrink-0 px-4 pt-3 pb-2 border-b border-white/5">
        <div className="flex gap-1.5 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchLanguage(l.code)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
              style={{
                background: language === l.code ? "var(--teal)" : "rgba(255,255,255,0.06)",
                color: language === l.code ? "var(--forest)" : "var(--cream)",
                border: language === l.code ? "1px solid var(--teal)" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
        {/* TTS availability hint */}
        {!hasTTS && (
          <p className="text-[10px] opacity-30 mt-1.5" style={{ color: "var(--cream)" }}>
            Audio playback not yet available for {currentLangLabel}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col gap-1.5" style={{ maxWidth: msg.role === "user" ? "78%" : "88%" }}>

              {/* Message bubble */}
              {msg.role === "user" ? (
                /* User message — plain text, right-aligned teal bubble */
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{ background: "var(--teal)", color: "var(--forest)", borderBottomRightRadius: "4px" }}
                >
                  {msg.content}
                </div>
              ) : (
                /* Assistant message — markdown rendered, left-aligned */
                <div
                  className="px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", borderBottomLeftRadius: "4px" }}
                >
                  <MarkdownMessage content={msg.content} />
                </div>
              )}

              {/* TTS button — only for assistant messages in TTS-supported languages */}
              {msg.role === "assistant" && hasTTS && (
                <button
                  onClick={() => playTTS(msg.content, i)}
                  disabled={ttsLoadingIdx === i}
                  className="self-start flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-opacity cursor-pointer disabled:opacity-40 hover:opacity-100"
                  style={{ color: "var(--teal)", opacity: 0.5 }}
                  title={`Listen in ${currentLangLabel}`}
                  aria-label={`Listen to this message in ${currentLangLabel}`}
                >
                  {ttsLoadingIdx === i ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                    </svg>
                  )}
                  <span>Listen</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl text-sm opacity-60"
              style={{ background: "rgba(255,255,255,0.07)", color: "var(--cream)" }}
            >
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — only shown before user sends first message */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
          {suggested.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors cursor-pointer"
              style={{ color: "var(--cream)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Clear conversation confirmation dialog ─────────────────────── */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-6"
            style={{ background: "#0C1F17", border: "1px solid rgba(255,255,255,0.12)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-dialog-title"
          >
            <div className="text-3xl mb-3 text-center">🗑️</div>
            <h2
              id="clear-dialog-title"
              className="font-black text-base text-center mb-1"
              style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
            >
              Clear conversation?
            </h2>
            <p className="text-xs text-center opacity-50 mb-6" style={{ color: "var(--cream)" }}>
              Your entire {currentLangLabel} history will be erased. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:border-white/40"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--cream)" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowClearConfirm(false);
                  await clearChatMessages(language);
                  setMessages([{ role: "assistant", content: WELCOME[language] ?? WELCOME[DEFAULT_LANG] }]);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#E74C3C", color: "#fff" }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XP toast — appears above mobile nav */}
      <XPToastContainer toasts={toasts} />

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-3 items-end"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              offline
                ? `Ask about ${currentLangLabel} (offline mode)…`
                : `Ask about ${currentLangLabel}…`
            }
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none focus:border-teal-500"
            style={{ color: "var(--cream)", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="gb-btn gb-btn-primary px-4 py-3 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-40 cursor-pointer"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
