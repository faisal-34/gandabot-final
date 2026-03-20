"use client";

import { useState } from "react";

interface PronunciationResult {
  score: number;
  feedback: string;
  tips: string;
}

const WORD_BANK = [
  { word: "Oli otya", meaning: "How are you?" },
  { word: "Webale", meaning: "Thank you" },
  { word: "Nkwagala", meaning: "I love you" },
  { word: "Nsanyuse", meaning: "I am happy" },
  { word: "Abaana", meaning: "Children" },
  { word: "Omwana", meaning: "Child" },
  { word: "Ekitabo", meaning: "Book" },
  { word: "Ennyumba", meaning: "House" },
  { word: "Omukazi", meaning: "Woman" },
  { word: "Omusajja", meaning: "Man" },
  { word: "Mpulira", meaning: "I understand" },
  { word: "Bambi", meaning: "Please / Oh dear" },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#2EB898" : score >= 60 ? "#F47B20" : "#E74C3C";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-black" style={{ color, fontFamily: "Fraunces, serif" }}>{score}</div>
        <div className="text-[10px] opacity-50" style={{ color: "var(--cream)" }}>/ 100</div>
      </div>
    </div>
  );
}

export function TutorView() {
  const [targetWord, setTargetWord] = useState(WORD_BANK[0]);
  const [attempt, setAttempt] = useState("");
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [loading, setLoading] = useState(false);

  function pickRandom() {
    const next = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setTargetWord(next);
    setAttempt("");
    setResult(null);
  }

  async function evaluate() {
    if (!attempt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/pronunciation-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: attempt, targetWord: targetWord.word }),
      });
      setResult(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Pronunciation Tutor</h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Practice Luganda pronunciation and get AI feedback</p>
      </div>

      {/* Target word */}
      <div className="mb-6 p-6 rounded-2xl border border-white/10 text-center" style={{ background: "rgba(33,144,121,0.08)" }}>
        <p className="text-xs opacity-50 mb-2 tracking-widest" style={{ color: "var(--cream)" }}>PRACTICE THIS WORD</p>
        <h2 className="text-4xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--teal-light)" }}>
          {targetWord.word}
        </h2>
        <p className="text-sm opacity-60" style={{ color: "var(--cream)" }}>{targetWord.meaning}</p>
        <button
          onClick={pickRandom}
          className="mt-4 px-4 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors"
          style={{ color: "var(--cream)" }}
        >
          🔀 Try another word
        </button>
      </div>

      {/* Word bank */}
      <div className="mb-6">
        <p className="text-xs opacity-40 mb-2" style={{ color: "var(--cream)" }}>WORD BANK</p>
        <div className="flex flex-wrap gap-2">
          {WORD_BANK.map((w) => (
            <button
              key={w.word}
              onClick={() => { setTargetWord(w); setAttempt(""); setResult(null); }}
              className="px-2.5 py-1 rounded-full text-xs border transition-colors"
              style={{
                borderColor: targetWord.word === w.word ? "var(--teal)" : "rgba(255,255,255,0.15)",
                background: targetWord.word === w.word ? "rgba(33,144,121,0.2)" : "transparent",
                color: "var(--cream)",
              }}
            >
              {w.word}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="text-xs opacity-40 block mb-2" style={{ color: "var(--cream)" }}>TYPE YOUR PRONUNCIATION ATTEMPT</label>
        <div className="flex gap-3">
          <input
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && evaluate()}
            placeholder={`Type how you'd say "${targetWord.word}"…`}
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none"
            style={{ color: "var(--cream)" }}
          />
          <button
            onClick={evaluate}
            disabled={loading || !attempt.trim()}
            className="gb-btn gb-btn-primary px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            {loading ? "…" : "Score"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="gb-rise-1 p-6 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-6 mb-5">
            <ScoreRing score={result.score} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--cream)" }}>{result.feedback}</p>
              <p className="text-xs opacity-50" style={{ color: "var(--cream)" }}>
                {result.score >= 80 ? "Excellent!" : result.score >= 60 ? "Good effort!" : "Keep practicing!"}
              </p>
            </div>
          </div>
          <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(244,123,32,0.1)", borderLeft: "3px solid var(--orange)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--orange)" }}>💡 Tip</p>
            <p className="text-xs opacity-80" style={{ color: "var(--cream)" }}>{result.tips}</p>
          </div>

          <button
            onClick={() => { setAttempt(""); setResult(null); }}
            className="mt-4 w-full py-2.5 rounded-xl text-sm border border-white/15 hover:border-teal-500 transition-colors"
            style={{ color: "var(--cream)" }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
