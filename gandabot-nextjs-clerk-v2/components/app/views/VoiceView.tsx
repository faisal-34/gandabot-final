"use client";

import { useState, useRef } from "react";

interface TranslationResult {
  original: string;
  translated: string;
  sourceLang: string;
  targetLang: string;
  cultural: string;
  // legacy compat
  english?: string;
  luganda?: string;
}

const QUICK_PHRASES = [
  "Good morning, how are you?",
  "My name is",
  "Thank you very much",
  "Where is the market?",
  "I am happy to meet you",
  "How much does this cost?",
];

export function VoiceView() {
  const [text, setText] = useState("");
  const [direction, setDirection] = useState<"en-lg" | "lg-en">("en-lg");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isEnToLg = direction === "en-lg";

  async function translate(input?: string) {
    const query = (input || text).trim();
    if (!query) return;
    setText(query);
    setLoading(true);
    setResult(null);
    setTtsError("");
    try {
      const res = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: query,
          sourceLang: isEnToLg ? "eng" : "lug",
          targetLang: isEnToLg ? "lug" : "eng",
        }),
      });
      const data: TranslationResult = await res.json();
      setResult(data);
      setHistory((h) => [data, ...h].slice(0, 10));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function playTTS() {
    if (!result) return;
    // Only play TTS for Luganda output (speaker ID 248)
    const textToSpeak = isEnToLg
      ? (result.translated || result.luganda || "")
      : (result.original || result.english || "");
    if (!textToSpeak) return;

    setTtsLoading(true);
    setTtsError("");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak, langCode: "lug" }),
      });
      const data = await res.json();
      if (!res.ok || !data.audioUrl) throw new Error(data.error || "TTS failed");
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      setTtsError("Could not play audio — try again shortly");
      console.error("[tts]", err);
    } finally {
      setTtsLoading(false);
    }
  }

  function copy(t: string) {
    navigator.clipboard.writeText(t).catch(() => {});
  }

  const lugandaText = isEnToLg
    ? (result?.translated || result?.luganda || "")
    : (result?.original || result?.english || "");
  const englishText = isEnToLg
    ? (result?.original || result?.english || "")
    : (result?.translated || result?.luganda || "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Voice Assistant
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          Translate between English and Luganda · powered by Sunbird AI
        </p>
      </div>

      {/* Direction toggle */}
      <div className="flex rounded-xl border border-white/20 overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.03)" }}>
        <button
          onClick={() => { setDirection("en-lg"); setResult(null); setText(""); }}
          className="flex-1 py-3 text-sm font-semibold transition-all cursor-pointer"
          style={{
            background: isEnToLg ? "var(--teal)" : "transparent",
            color: isEnToLg ? "var(--forest)" : "var(--cream)",
            opacity: isEnToLg ? 1 : 0.5,
          }}
        >
          English → Luganda
        </button>
        <button
          onClick={() => { setDirection("lg-en"); setResult(null); setText(""); }}
          className="flex-1 py-3 text-sm font-semibold transition-all cursor-pointer"
          style={{
            background: !isEnToLg ? "var(--teal)" : "transparent",
            color: !isEnToLg ? "var(--forest)" : "var(--cream)",
            opacity: !isEnToLg ? 1 : 0.5,
          }}
        >
          Luganda → English
        </button>
      </div>

      {/* Input */}
      <div className="mb-5">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) translate(); }}
          placeholder={isEnToLg ? "Type English text to translate to Luganda…" : "Wandiika mu Luganda omanye mu Lungereza…"}
          className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none resize-none mb-3"
          style={{ color: "var(--cream)" }}
        />
        <button
          onClick={() => translate()}
          disabled={loading || !text.trim()}
          className="gb-btn gb-btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40 cursor-pointer"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          {loading ? "Translating…" : "Translate + Cultural Context"}
        </button>
      </div>

      {/* Quick phrases */}
      <div className="mb-8">
        <p className="text-xs opacity-40 mb-2" style={{ color: "var(--cream)" }}>QUICK PHRASES</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PHRASES.map((p) => (
            <button key={p} onClick={() => translate(p)}
              className="px-3 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors cursor-pointer"
              style={{ color: "var(--cream)" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 rounded-full border-2 mx-auto mb-3 animate-spin"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }} />
          <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Sunbird AI translating…</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="gb-rise-1 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* English */}
            <div className="p-5 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs opacity-40 font-medium tracking-widest" style={{ color: "var(--cream)" }}>ENGLISH</span>
                <button onClick={() => copy(englishText)}
                  className="text-xs opacity-30 hover:opacity-70 transition-opacity cursor-pointer"
                  style={{ color: "var(--cream)" }} title="Copy">⎘</button>
              </div>
              <p className="text-base font-medium leading-relaxed" style={{ color: "var(--cream)" }}>{englishText}</p>
            </div>

            {/* Luganda */}
            <div className="p-5 rounded-2xl border" style={{ background: "rgba(33,144,121,0.1)", borderColor: "rgba(33,144,121,0.3)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium tracking-widest" style={{ color: "var(--teal)" }}>LUGANDA</span>
                <div className="flex items-center gap-2">
                  {/* TTS — Luganda audio */}
                  <button
                    onClick={playTTS}
                    disabled={ttsLoading || !lugandaText}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                    style={{ background: "rgba(33,144,121,0.2)", color: "var(--teal)" }}
                    title="Listen to Luganda"
                  >
                    {ttsLoading ? (
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                    )}
                    <span>Listen</span>
                  </button>
                  <button onClick={() => copy(lugandaText)}
                    className="text-xs opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "var(--teal-light)" }} title="Copy">⎘</button>
                </div>
              </div>
              <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--teal-light)" }}>{lugandaText}</p>
            </div>
          </div>

          {ttsError && (
            <p className="text-xs mb-3 opacity-70" style={{ color: "var(--orange)" }}>{ttsError}</p>
          )}

          {/* Cultural context */}
          {result.cultural && (
            <div className="p-4 rounded-xl" style={{ background: "rgba(244,123,32,0.08)", borderLeft: "3px solid var(--orange)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--orange)" }}>🎭 Cultural Context</p>
              <p className="text-sm opacity-80 leading-relaxed" style={{ color: "var(--cream)" }}>{result.cultural}</p>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)" }} />
            <p className="text-xs opacity-30" style={{ color: "var(--cream)" }}>Sunbird AI · Luganda translation + audio</p>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs opacity-40 mb-3" style={{ color: "var(--cream)" }}>RECENT TRANSLATIONS</p>
          <div className="flex flex-col gap-2">
            {history.slice(0, 5).map((h, i) => (
              <button key={i}
                onClick={() => { setText(h.original || h.english || ""); setResult(h); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-teal-500/30 transition-colors text-left cursor-pointer"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--cream)" }}>{h.original || h.english}</p>
                  <p className="text-xs opacity-50 truncate" style={{ color: "var(--teal-light)" }}>{h.translated || h.luganda}</p>
                </div>
                <span className="text-xs opacity-30" style={{ color: "var(--cream)" }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && history.length === 0 && (
        <div className="text-center py-12 opacity-30" style={{ color: "var(--cream)" }}>
          <div className="text-5xl mb-4">🗣️</div>
          <p className="text-sm">Enter any English or Luganda phrase to get a translation, cultural context, and audio pronunciation.</p>
        </div>
      )}
    </div>
  );
}
