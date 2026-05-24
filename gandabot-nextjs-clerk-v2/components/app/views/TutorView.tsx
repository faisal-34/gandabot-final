"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LANGUAGES } from "@/lib/languages";
import type { TTSApiResponse } from "@/lib/tts";
import { awardXP } from "@/lib/xp";
import { useXPToast, XPToastContainer } from "@/components/app/XPToast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WordEntry {
  word: string;
  meaning: string;
}

interface PronunciationResult {
  score: number;
  feedback: string;
  tips: string;
}

type AnySpeechRecognition = SpeechRecognition;
interface WindowWithSpeech extends Window {
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

// ─── Static word banks (guaranteed offline fallback) ─────────────────────────
// These are always available even if the API is unreachable.

const STATIC_WORDS: Record<string, WordEntry[]> = {
  lug: [
    { word: "Oli otya",   meaning: "How are you?" },
    { word: "Webale",     meaning: "Thank you" },
    { word: "Nkwagala",  meaning: "I love you" },
    { word: "Nsanyuse",  meaning: "I am happy" },
    { word: "Abaana",    meaning: "Children" },
    { word: "Omwana",    meaning: "Child" },
    { word: "Ekitabo",   meaning: "Book" },
    { word: "Ennyumba",  meaning: "House" },
    { word: "Omukazi",   meaning: "Woman" },
    { word: "Omusajja",  meaning: "Man" },
    { word: "Mpulira",   meaning: "I understand" },
    { word: "Bambi",     meaning: "Please / Oh dear" },
  ],
  ach: [
    { word: "Apwoyo",    meaning: "Thank you" },
    { word: "Itye nining", meaning: "How are you?" },
    { word: "Maber",     meaning: "Good / Fine" },
    { word: "Bedo maber", meaning: "Stay well" },
    { word: "Abila",     meaning: "Fire" },
    { word: "Dano",      meaning: "People" },
    { word: "Gwoko",     meaning: "Keep / Guard" },
    { word: "Lok",       meaning: "Word / Language" },
    { word: "Mony",      meaning: "War / Conflict" },
    { word: "Nino",      meaning: "Day" },
    { word: "Ot",        meaning: "Home / House" },
    { word: "Twero",     meaning: "Strength / Power" },
  ],
  teo: [
    { word: "Ejok",      meaning: "Good" },
    { word: "Ai",        meaning: "Yes" },
    { word: "Daada",     meaning: "Father" },
    { word: "Mama",      meaning: "Mother" },
    { word: "Eong",      meaning: "I / Me" },
    { word: "Ijo",       meaning: "Water" },
    { word: "Akello",    meaning: "Born after twins" },
    { word: "Aibo",      meaning: "Friend" },
    { word: "Apii",      meaning: "Come" },
    { word: "Ingolo",    meaning: "Today" },
    { word: "Noi",       meaning: "House" },
    { word: "Tela",      meaning: "One" },
  ],
  nyn: [
    { word: "Agandi",    meaning: "Hello" },
    { word: "Nkurunziza", meaning: "How are you?" },
    { word: "Webale",    meaning: "Thank you" },
    { word: "Tukora",    meaning: "Let's work" },
    { word: "Omushana",  meaning: "Morning" },
    { word: "Akabira",   meaning: "Forest" },
    { word: "Ente",      meaning: "Cow" },
    { word: "Omutsigye", meaning: "Guest" },
    { word: "Amata",     meaning: "Milk" },
    { word: "Nyabo",     meaning: "Madam" },
    { word: "Sebo",      meaning: "Sir" },
    { word: "Tugaruke",  meaning: "Let us return" },
  ],
  lgg: [
    { word: "Nzia",      meaning: "Good" },
    { word: "Dri",       meaning: "Peace" },
    { word: "Ma",        meaning: "Mother" },
    { word: "Ba",        meaning: "Father" },
    { word: "Idi",       meaning: "Come" },
    { word: "Eyi",       meaning: "This" },
    { word: "Azo",       meaning: "Fire" },
    { word: "Oni",       meaning: "Rain" },
    { word: "Ri",        meaning: "Eat" },
    { word: "Vu",        meaning: "Go" },
    { word: "Kiri",      meaning: "Tree" },
    { word: "Siku",      meaning: "Day / Sun" },
  ],
  swh: [
    { word: "Habari",    meaning: "How are you? / News" },
    { word: "Asante",    meaning: "Thank you" },
    { word: "Karibu",    meaning: "Welcome" },
    { word: "Kwaheri",   meaning: "Goodbye" },
    { word: "Ndiyo",     meaning: "Yes" },
    { word: "Hapana",    meaning: "No" },
    { word: "Pole",      meaning: "Sorry / Slowly" },
    { word: "Haraka",    meaning: "Quickly / Hurry" },
    { word: "Chakula",   meaning: "Food" },
    { word: "Maji",      meaning: "Water" },
    { word: "Nyumba",    meaning: "House" },
    { word: "Rafiki",    meaning: "Friend" },
  ],
};

// BCP-47 tags for SpeechRecognition — mirrors lib/languages.ts bcp47 field
const SPEECH_LANG: Record<string, string> = {
  lug: "lg",
  ach: "ach",
  teo: "teo",
  nyn: "nyn",
  lgg: "lgg",
  swh: "sw",
};

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#2EB898" : score >= 60 ? "#F47B20" : "#E74C3C";
  const r     = 36;
  const circ  = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
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

// ─── Mic button ───────────────────────────────────────────────────────────────

function MicButton({ listening, supported, onClick }: {
  listening: boolean;
  supported: boolean;
  onClick: () => void;
}) {
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      title={listening ? "Stop recording" : "Record your pronunciation"}
      aria-label={listening ? "Stop recording" : "Record your pronunciation"}
      className="relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
      style={{
        background: listening ? "rgba(231,76,60,0.15)" : "rgba(255,255,255,0.06)",
        border: `1px solid ${listening ? "#E74C3C" : "rgba(255,255,255,0.2)"}`,
        color: listening ? "#E74C3C" : "var(--cream)",
      }}
    >
      {listening && (
        <span className="absolute inset-0 rounded-xl animate-ping" style={{ background: "rgba(231,76,60,0.25)" }} />
      )}
      <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {listening ? (
          <rect x="6" y="6" width="12" height="12" rx="2" />
        ) : (
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 13.93A7.001 7.001 0 0 1 5 8H3a9 9 0 0 0 8 8.94V20H8v2h8v-2h-3v-3.07A9 9 0 0 0 21 8h-2a7 7 0 0 1-6 6.93z" />
        )}
      </svg>
    </button>
  );
}

// ─── TutorView ────────────────────────────────────────────────────────────────

export function TutorView() {
  const [language,     setLanguage]    = useState("lug");
  const [wordBank,     setWordBank]    = useState<WordEntry[]>(STATIC_WORDS.lug);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [targetWord,   setTargetWord]  = useState<WordEntry>(STATIC_WORDS.lug[0]);
  const [attempt,      setAttempt]     = useState("");
  const [result,       setResult]      = useState<PronunciationResult | null>(null);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState("");

  // Voice input
  const [micSupported, setMicSupported] = useState(false);
  const [listening,    setListening]    = useState(false);
  const [interimText,  setInterimText]  = useState("");
  const recognitionRef = useRef<AnySpeechRecognition | null>(null);

  const { toasts, showXP } = useXPToast();

  // TTS — "Hear it" playback
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Detect mic support ────────────────────────────────────────────────────
  useEffect(() => {
    const win = window as WindowWithSpeech;
    setMicSupported(!!(win.SpeechRecognition ?? win.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.abort();
      // Stop any playing audio on unmount
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  // ── Load word bank when language changes ──────────────────────────────────
  const loadWordBank = useCallback(async (lang: string) => {
    // Start with static words immediately (no loading flash)
    const staticWords = STATIC_WORDS[lang] ?? STATIC_WORDS.lug;
    setWordBank(staticWords);
    setTargetWord(staticWords[0]);
    setAttempt("");
    setResult(null);
    setError("");
    setInterimText("");
    recognitionRef.current?.abort();
    setListening(false);

    // Try to fetch dynamic words from API (augments static set)
    setWordsLoading(true);
    try {
      const res = await fetch(`/api/pronunciation-tutor/words?language=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setWordBank(data);
          setTargetWord(data[0]);
        }
      }
      // Non-2xx → silently keep static words
    } catch {
      // Network error → keep static words (already set)
    } finally {
      setWordsLoading(false);
    }
  }, []);

  // Load on mount (lug) and on language switch
  useEffect(() => {
    loadWordBank(language);
  }, [language, loadWordBank]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function resetInput() {
    setAttempt("");
    setResult(null);
    setError("");
    setInterimText("");
    recognitionRef.current?.abort();
    setListening(false);
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }

  // ── "Hear it" — play correct pronunciation via GandaBot voice ────────────
  async function playWordTTS(word?: string) {
    const target = word ?? targetWord.word;
    if (!target || ttsLoading) return;
    stopAudio();
    setTtsLoading(true);
    try {
      const res = await fetch("/api/tts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: target, langCode: language }),
      });
      const data: TTSApiResponse & { error?: string } = await res.json();
      if (!res.ok || !data.audioUrl) throw new Error(data.error ?? "Audio unavailable");
      const audio = new Audio(data.audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => { audioRef.current = null; };
    } catch {
      // TTS is a non-critical enhancement — fail silently
    } finally {
      setTtsLoading(false);
    }
  }

  function pickRandom() {
    stopAudio();
    const pool = wordBank.filter((w) => w.word !== targetWord.word);
    const next = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : wordBank[0];
    setTargetWord(next);
    resetInput();
  }

  // ── Voice input ───────────────────────────────────────────────────────────
  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setInterimText("");
      return;
    }

    const win = window as WindowWithSpeech;
    const SR  = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR() as AnySpeechRecognition;
    recognitionRef.current = recognition;
    recognition.lang            = SPEECH_LANG[language] ?? "lg";
    recognition.interimResults  = true;
    recognition.maxAlternatives = 3;
    recognition.continuous      = false;

    recognition.onstart = () => { setListening(true); setError(""); setResult(null); };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final   = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) { final += t; } else { interim += t; }
      }
      if (final) {
        setAttempt((prev) => (prev + " " + final).trim());
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        setError("No speech detected — try speaking closer to the mic.");
      } else if (event.error === "not-allowed") {
        setError("Microphone access denied — please allow mic permission and try again.");
        setMicSupported(false);
      } else {
        setError(`Microphone error: ${event.error}`);
      }
      setListening(false);
      setInterimText("");
    };

    recognition.onend = () => { setListening(false); setInterimText(""); };

    try {
      recognition.start();
    } catch {
      setError("Could not start the microphone. Please try again.");
      setListening(false);
    }
  }

  // ── Evaluate pronunciation ────────────────────────────────────────────────
  async function evaluate() {
    if (!attempt.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/pronunciation-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: attempt, targetWord: targetWord.word, language }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: PronunciationResult = await res.json();
      if (typeof data.score !== "number" || !data.feedback) {
        throw new Error("Unexpected response from tutor");
      }
      setResult(data);
      if (data.score >= 90)      showXP(await awardXP("pronunciation_great"));
      else if (data.score >= 70) showXP(await awardXP("pronunciation_pass"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not evaluate — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <XPToastContainer toasts={toasts} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Pronunciation Tutor
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          Practice speaking and get instant AI feedback
          {micSupported && <span className="ml-2 opacity-60">· 🎤 Voice input ready</span>}
        </p>
      </div>

      {/* Language selector */}
      <div className="mb-6">
        <p className="text-xs opacity-40 mb-2 tracking-widest" style={{ color: "var(--cream)" }}>
          PRACTICE LANGUAGE
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: language === l.code ? "var(--teal)" : "rgba(255,255,255,0.06)",
                color:      language === l.code ? "var(--forest)" : "var(--cream)",
                border:     language === l.code ? "1px solid var(--teal)" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target word card */}
      <div
        className="mb-6 p-6 rounded-2xl border border-white/10 text-center"
        style={{ background: "rgba(33,144,121,0.08)" }}
      >
        <p className="text-xs opacity-50 mb-2 tracking-widest" style={{ color: "var(--cream)" }}>
          PRACTICE THIS {langLabel.toUpperCase()} WORD
        </p>
        <h2
          className="text-4xl font-black mb-2"
          style={{ fontFamily: "Fraunces, serif", color: "var(--teal-light)" }}
        >
          {wordsLoading ? "…" : targetWord.word}
        </h2>
        <p className="text-sm opacity-60 mb-4" style={{ color: "var(--cream)" }}>
          {targetWord.meaning}
        </p>

        {/* Hear it button — GandaBot voice */}
        <button
          onClick={() => playWordTTS()}
          disabled={ttsLoading || wordsLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-40 mb-3"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
          title="Hear the correct pronunciation"
        >
          {ttsLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          )}
          {ttsLoading ? "Playing…" : "Hear it"}
        </button>

        <div>
          <button
            onClick={pickRandom}
            disabled={wordsLoading || wordBank.length <= 1}
            className="px-4 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors disabled:opacity-30"
            style={{ color: "var(--cream)" }}
          >
            🔀 Try another word
          </button>
        </div>
      </div>

      {/* Word bank chips */}
      <div className="mb-6">
        <p className="text-xs opacity-40 mb-2" style={{ color: "var(--cream)" }}>WORD BANK</p>
        {wordsLoading ? (
          <div className="flex gap-2 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-6 rounded-full animate-pulse"
                style={{ width: `${50 + i * 12}px`, background: "rgba(255,255,255,0.08)" }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {wordBank.map((w) => (
              <button
                key={w.word}
                onClick={() => { stopAudio(); setTargetWord(w); resetInput(); }}
                title={w.meaning}
                className="px-2.5 py-1 rounded-full text-xs border transition-colors"
                style={{
                  borderColor: targetWord.word === w.word ? "var(--teal)" : "rgba(255,255,255,0.15)",
                  background:  targetWord.word === w.word ? "rgba(33,144,121,0.2)" : "transparent",
                  color: "var(--cream)",
                }}
              >
                {w.word}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input row */}
      <div className="mb-2">
        <label className="text-xs opacity-40 block mb-2" style={{ color: "var(--cream)" }}>
          {micSupported ? "TYPE OR SPEAK YOUR ATTEMPT" : "TYPE YOUR ATTEMPT"}
        </label>
        <div className="flex gap-2">
          <input
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && evaluate()}
            placeholder={listening ? "Listening…" : `How do you say "${targetWord.word}"?`}
            disabled={listening}
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none disabled:opacity-50"
            style={{ color: "var(--cream)" }}
          />
          <MicButton listening={listening} supported={micSupported} onClick={toggleMic} />
          <button
            onClick={evaluate}
            disabled={loading || !attempt.trim() || listening}
            className="px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 shrink-0 transition-opacity"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            {loading ? "…" : "Score"}
          </button>
        </div>
      </div>

      {/* Live interim transcript */}
      {interimText && (
        <div
          className="mb-4 px-3 py-2 rounded-lg flex items-center gap-2 text-xs"
          style={{ background: "rgba(231,76,60,0.1)", color: "#E74C3C", border: "1px solid rgba(231,76,60,0.25)" }}
        >
          <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ background: "#E74C3C" }} />
          <span className="opacity-80">Hearing:</span>
          <span className="font-medium italic truncate">{interimText}</span>
        </div>
      )}

      {/* Mic hint */}
      {micSupported && !listening && !interimText && !attempt && (
        <p className="text-[11px] opacity-30 mb-6 px-1" style={{ color: "var(--cream)" }}>
          🎤 Tap the mic, say &ldquo;{targetWord.word}&rdquo;, then tap Stop — your speech fills the box automatically.
        </p>
      )}

      {/* Error */}
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl border border-orange-500/30 flex items-start gap-2"
          style={{ background: "rgba(244,123,32,0.08)", color: "var(--orange)" }}
        >
          <span className="shrink-0">⚠</span>
          <p className="text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-xs opacity-60 hover:opacity-100 shrink-0">✕</button>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div
          className="gb-rise-1 p-6 rounded-2xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center gap-6 mb-5">
            <ScoreRing score={result.score} />
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--cream)" }}>
                {result.feedback}
              </p>
              <p className="text-xs opacity-50" style={{ color: "var(--cream)" }}>
                {result.score >= 90 ? "🏆 Outstanding!"
                  : result.score >= 70 ? "⭐ Great effort!"
                  : result.score >= 50 ? "💪 Almost there!"
                  : "📚 Keep practicing!"}
              </p>
            </div>
          </div>

          <div
            className="px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(244,123,32,0.1)", borderLeft: "3px solid var(--orange)" }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--orange)" }}>💡 Tip</p>
            <p className="text-xs opacity-80" style={{ color: "var(--cream)" }}>{result.tips}</p>
          </div>

          <p className="text-xs opacity-40 mb-4" style={{ color: "var(--cream)" }}>
            You said: <span className="italic opacity-80">&ldquo;{attempt}&rdquo;</span>
          </p>

          {/* Hear the correct pronunciation after scoring */}
          <button
            onClick={() => playWordTTS()}
            disabled={ttsLoading}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: "rgba(33,144,121,0.15)", color: "var(--teal-light)" }}
          >
            {ttsLoading ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
            Hear correct pronunciation
          </button>

          <div className="flex gap-3">
            <button
              onClick={resetInput}
              className="flex-1 py-2.5 rounded-xl text-sm border border-white/15 hover:border-teal-500 transition-colors"
              style={{ color: "var(--cream)" }}
            >
              Try Again
            </button>
            <button
              onClick={pickRandom}
              className="flex-1 py-2.5 rounded-xl text-sm border border-white/15 hover:border-teal-500 transition-colors"
              style={{ color: "var(--cream)" }}
            >
              🔀 Next Word
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
