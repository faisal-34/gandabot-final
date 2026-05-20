"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LANGUAGES = [
  { code: "lug", label: "Luganda" },
  { code: "ach", label: "Acholi" },
  { code: "teo", label: "Ateso" },
  { code: "nyn", label: "Runyankole" },
  { code: "lgg", label: "Lugbara" },
  { code: "swh", label: "Swahili" },
];

const TTS_SUPPORTED = ["lug", "ach", "teo", "nyn"];

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

export function ChatView() {
  const [language, setLanguage] = useState("lug");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME.lug },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsLoadingIdx, setTtsLoadingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function switchLanguage(lang: string) {
    setLanguage(lang);
    setMessages([{ role: "assistant", content: WELCOME[lang] ?? WELCOME.lug }]);
    setInput("");
  }

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content) return;
    setInput("");
    const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/gandabot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language: langLabel }),
      });
      const data = await res.json();
      setMessages([...newMessages, {
        role: "assistant",
        content: data.reply || "Bambi — something went wrong. Please try again.",
      }]);
    } catch {
      setMessages([...newMessages, {
        role: "assistant",
        content: "Nkwetaaga okugenda briefly — please try again!",
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function playTTS(text: string, idx: number) {
    const ttsLang = TTS_SUPPORTED.includes(language) ? language : "lug";
    setTtsLoadingIdx(idx);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, langCode: ttsLang }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioUrl) throw new Error("TTS failed");
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.play();
    } catch {
      // silent — TTS is optional enhancement
    } finally {
      setTtsLoadingIdx(null);
    }
  }

  const suggested = SUGGESTED[language] ?? SUGGESTED.lug;
  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: "var(--teal)", color: "var(--forest)" }}>G</div>
        <div className="min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--cream)" }}>GandaBot</div>
          <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>AI Language Tutor · Sunbird AI</div>
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs opacity-50 hidden sm:block" style={{ color: "var(--cream)" }}>Online</span>
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
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex flex-col gap-1 max-w-[78%]">
              <div
                className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "var(--teal)", color: "var(--forest)", borderBottomRightRadius: "4px" }
                    : { background: "rgba(255,255,255,0.07)", color: "var(--cream)", borderBottomLeftRadius: "4px" }
                }
              >
                {msg.content}
              </div>
              {/* TTS on assistant messages */}
              {msg.role === "assistant" && (
                <button
                  onClick={() => playTTS(msg.content, i)}
                  disabled={ttsLoadingIdx === i}
                  className="self-start flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity cursor-pointer disabled:opacity-40 hover:opacity-100"
                  style={{ color: "var(--teal)", opacity: 0.5 }}
                  title="Listen"
                >
                  {ttsLoadingIdx === i ? (
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
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
            <div className="px-4 py-3 rounded-2xl text-sm opacity-60"
              style={{ background: "rgba(255,255,255,0.07)", color: "var(--cream)" }}>
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

      {/* Suggestions */}
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

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-3 items-end">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask about ${currentLangLabel}…`}
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
