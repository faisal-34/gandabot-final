"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LANGUAGES } from "@/lib/languages";
import { awardXP } from "@/lib/xp";
import { useXPToast, XPToastContainer } from "@/components/app/XPToast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Podcast {
  id: number;
  title: string;
  description: string;
  language: string;
  category: string;
  topic: string;
  script: string;
  audio_url: string | null;
  listens: number;
  is_ai_generated: boolean;
  created_at: string;
}

// ─── Language → API name mapping ─────────────────────────────────────────────
// The podcasts API stores language as a lowercase full name (e.g. "luganda").

const LANG_API_NAME: Record<string, string> = {
  lug: "luganda",
  ach: "acholi",
  teo: "ateso",
  nyn: "runyankole",
  lgg: "lugbara",
  swh: "swahili",
};

// ─── Topic suggestions per language ──────────────────────────────────────────

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  lug: [
    "Greetings and introductions",
    "Ugandan food and cuisine",
    "Luganda numbers and counting",
    "Kampala city life",
    "Traditional Baganda ceremonies",
    "Luganda proverbs and wisdom",
  ],
  ach: [
    "Acholi greetings and customs",
    "Acholi traditional music",
    "Northern Uganda culture",
    "Acholi proverbs and stories",
    "Food and cooking in Acholi",
    "Numbers in Acholi language",
  ],
  teo: [
    "Ateso greetings and phrases",
    "Iteso cultural practices",
    "Eastern Uganda traditions",
    "Ateso numbers and counting",
    "Iteso food and agriculture",
    "Ateso proverbs and wisdom",
  ],
  nyn: [
    "Runyankole greetings",
    "Ankole cattle culture",
    "Western Uganda traditions",
    "Runyankole proverbs",
    "Ankole food and cuisine",
    "Numbers in Runyankole",
  ],
  lgg: [
    "Lugbara greetings and culture",
    "West Nile region traditions",
    "Lugbara proverbs and stories",
    "Numbers in Lugbara",
    "Lugbara music and dance",
    "Food traditions of the Lugbara",
  ],
  swh: [
    "Swahili greetings and phrases",
    "East African coastal culture",
    "Swahili proverbs — Methali",
    "Numbers and counting in Swahili",
    "Swahili food and cuisine",
    "History of the Swahili language",
  ],
};

// ─── PodcastsView ─────────────────────────────────────────────────────────────

export function PodcastsView() {
  const [language,   setLanguage]   = useState("lug");
  const [podcasts,   setPodcasts]   = useState<Podcast[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [topic,      setTopic]      = useState("");
  const [generating, setGenerating] = useState(false);
  const [playing,    setPlaying]    = useState<number | null>(null);
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [loadError,  setLoadError]  = useState("");
  const { toasts, showXP } = useXPToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const langLabel   = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";
  const apiLangName = LANG_API_NAME[language] ?? "luganda";
  const suggestions = TOPIC_SUGGESTIONS[language] ?? TOPIC_SUGGESTIONS.lug;

  // ── Load podcasts ──────────────────────────────────────────────────────────
  const loadPodcasts = useCallback(async (lang: string) => {
    setLoading(true);
    setLoadError("");
    // Stop any currently playing audio when switching language
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
      setPlaying(null);
    }
    try {
      const apiName = LANG_API_NAME[lang] ?? "luganda";
      const res = await fetch(`/api/podcasts?language=${apiName}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPodcasts(Array.isArray(data) ? data : []);
      setExpanded(null);
    } catch {
      setLoadError("Could not load episodes. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload when language changes
  useEffect(() => {
    loadPodcasts(language);
  }, [language, loadPodcasts]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    };
  }, []);

  // ── Generate episode ───────────────────────────────────────────────────────
  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setLoadError("");
    try {
      const res = await fetch("/api/podcasts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), language: apiLangName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.podcast) {
        setPodcasts((prev) => [data.podcast, ...prev]);
        setTopic("");
        setExpanded(data.podcast.id);
        showXP(await awardXP("podcast_generated"));
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setLoadError(`Could not generate episode: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  // ── Audio playback ─────────────────────────────────────────────────────────
  function playAudio(podcast: Podcast) {
    if (!podcast.audio_url) return;

    // Same podcast → toggle pause
    if (playing === podcast.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
      setPlaying(null);
      return;
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }

    const audio = new Audio(podcast.audio_url);
    audioRef.current = audio;
    audio.play().catch(() => {
      setLoadError("Could not play audio — browser may have blocked autoplay.");
      audioRef.current = null;
      setPlaying(null);
    });
    setPlaying(podcast.id);
    audio.onended = () => { audioRef.current = null; setPlaying(null); };
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <XPToastContainer toasts={toasts} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Podcast Hub
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          AI-generated learning episodes · {langLabel}
        </p>
      </div>

      {/* Language selector */}
      <div className="mb-6">
        <p className="text-xs opacity-40 mb-2 tracking-widest" style={{ color: "var(--cream)" }}>
          LANGUAGE
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setTopic(""); }}
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

      {/* Generate card */}
      <div
        className="mb-8 p-5 rounded-2xl border border-white/10"
        style={{ background: "rgba(33,144,121,0.08)" }}
      >
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--teal-light)" }}>
          ✨ Generate a new {langLabel} episode
        </h2>
        <div className="flex gap-3 mb-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder={`Enter a ${langLabel} topic…`}
            className="flex-1 px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm outline-none"
            style={{ color: "var(--cream)" }}
          />
          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            className="gb-btn gb-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 shrink-0"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="px-2.5 py-1 rounded-full text-xs border border-white/15 hover:border-teal-500 transition-colors"
              style={{ color: "var(--cream)" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div
          className="mb-4 px-4 py-3 rounded-xl border border-orange-500/30 flex items-start gap-3"
          style={{ background: "rgba(244,123,32,0.08)" }}
        >
          <span style={{ color: "var(--orange)" }}>⚠</span>
          <p className="text-sm flex-1" style={{ color: "var(--orange)" }}>{loadError}</p>
          <button
            onClick={() => setLoadError("")}
            className="text-xs opacity-60 hover:opacity-100"
            style={{ color: "var(--orange)" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 opacity-40" style={{ color: "var(--cream)" }}>
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin mb-3"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }}
          />
          <p className="text-sm">Loading {langLabel} episodes…</p>
        </div>
      )}

      {/* Generating overlay */}
      {generating && (
        <div
          className="mb-4 p-4 rounded-xl border border-teal-500/30 flex items-center gap-3"
          style={{ background: "rgba(33,144,121,0.08)" }}
        >
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin shrink-0"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }}
          />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--teal-light)" }}>
              Creating your {langLabel} episode…
            </p>
            <p className="text-xs opacity-60" style={{ color: "var(--cream)" }}>
              Writing script and generating audio — this takes ~30 seconds
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && podcasts.length === 0 && (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-5xl mb-4">🎧</div>
          <p className="text-sm">No {langLabel} episodes yet.</p>
          <p className="text-xs mt-1 opacity-70">Generate the first one above!</p>
        </div>
      )}

      {/* Podcast list */}
      <div className="flex flex-col gap-4">
        {podcasts.map((pod) => (
          <div
            key={pod.id}
            className="rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                {/* Play / Pause button */}
                <button
                  onClick={() => playAudio(pod)}
                  disabled={!pod.audio_url}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{
                    background: playing === pod.id ? "var(--orange)" : "var(--teal)",
                    color: "var(--forest)",
                  }}
                  title={pod.audio_url ? (playing === pod.id ? "Pause" : "Play") : "No audio available"}
                  aria-label={playing === pod.id ? "Pause episode" : "Play episode"}
                >
                  {playing === pod.id ? "⏸" : "▶"}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--cream)" }}>
                      {pod.title}
                    </h3>
                    {pod.is_ai_generated && (
                      <span
                        className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: "rgba(33,144,121,0.2)", color: "var(--teal-light)" }}
                      >
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed line-clamp-2" style={{ color: "var(--cream)" }}>
                    {pod.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-40" style={{ color: "var(--cream)" }}>
                    <span>🎵 {pod.language}</span>
                    <span>👁 {pod.listens} listens</span>
                    <span>{new Date(pod.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Expand / collapse transcript */}
                <button
                  onClick={() => setExpanded(expanded === pod.id ? null : pod.id)}
                  className="shrink-0 text-xs opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--cream)" }}
                  aria-label={expanded === pod.id ? "Hide transcript" : "Show transcript"}
                >
                  {expanded === pod.id ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {/* Transcript */}
            {expanded === pod.id && pod.script && (
              <div className="px-5 pb-5 border-t border-white/10">
                <h4 className="text-xs font-semibold mb-2 mt-3 opacity-50" style={{ color: "var(--cream)" }}>
                  TRANSCRIPT
                </h4>
                <p className="text-xs leading-relaxed opacity-70 whitespace-pre-line" style={{ color: "var(--cream)" }}>
                  {pod.script}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
