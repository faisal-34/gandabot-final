"use client";

import { useState } from "react";

interface TranslationResult {
  english: string;
  luganda: string;
  cultural: string;
}

const QUICK_PHRASES = [
  "Good morning, how are you?",
  "My name is",
  "I want to learn Luganda",
  "Where is the market?",
  "Thank you very much",
  "I am happy to meet you",
];

export function VoiceView() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TranslationResult[]>([]);

  async function translate(input?: string) {
    const query = (input || text).trim();
    if (!query) return;
    setText(query);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query, action: "translate" }),
      });
      const data: TranslationResult = await res.json();
      setResult(data);
      setHistory((h) => [data, ...h].slice(0, 10));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Voice Assistant</h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Translate between English and Luganda with cultural context</p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type English or Luganda text to translate…"
          className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none resize-none mb-3"
          style={{ color: "var(--cream)" }}
        />
        <button
          onClick={() => translate()}
          disabled={loading || !text.trim()}
          className="gb-btn gb-btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
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
            <button
              key={p}
              onClick={() => translate(p)}
              className="px-3 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors"
              style={{ color: "var(--cream)" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto mb-3 animate-spin" style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }} />
          <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Translating…</p>
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
                <button onClick={() => copyToClipboard(result.english)} className="text-xs opacity-30 hover:opacity-70 transition-opacity" style={{ color: "var(--cream)" }} title="Copy">⎘</button>
              </div>
              <p className="text-base font-medium leading-relaxed" style={{ color: "var(--cream)" }}>{result.english}</p>
            </div>

            {/* Luganda */}
            <div className="p-5 rounded-2xl border" style={{ background: "rgba(33,144,121,0.1)", borderColor: "rgba(33,144,121,0.3)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium tracking-widest" style={{ color: "var(--teal)" }}>LUGANDA</span>
                <button onClick={() => copyToClipboard(result.luganda)} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{ color: "var(--teal-light)" }} title="Copy">⎘</button>
              </div>
              <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--teal-light)" }}>{result.luganda}</p>
            </div>
          </div>

          {/* Cultural context */}
          {result.cultural && (
            <div className="p-4 rounded-xl" style={{ background: "rgba(244,123,32,0.08)", borderLeft: "3px solid var(--orange)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--orange)" }}>🎭 Cultural Context</p>
              <p className="text-sm opacity-80 leading-relaxed" style={{ color: "var(--cream)" }}>{result.cultural}</p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs opacity-40 mb-3" style={{ color: "var(--cream)" }}>RECENT TRANSLATIONS</p>
          <div className="flex flex-col gap-2">
            {history.slice(0, 5).map((h, i) => (
              <button
                key={i}
                onClick={() => { setText(h.english); setResult(h); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 hover:border-teal-500/30 transition-colors text-left"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--cream)" }}>{h.english}</p>
                  <p className="text-xs opacity-50 truncate" style={{ color: "var(--teal-light)" }}>{h.luganda}</p>
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
          <p className="text-sm">Enter any English or Luganda phrase to get a translation and cultural context.</p>
        </div>
      )}
    </div>
  );
}
