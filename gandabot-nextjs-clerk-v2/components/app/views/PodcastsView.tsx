"use client";

import { useState, useEffect, useRef } from "react";

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

const TOPIC_SUGGESTIONS = [
  "Greetings and introductions",
  "Ugandan food and cuisine",
  "Luganda numbers and counting",
  "Kampala city life",
  "Traditional Baganda ceremonies",
  "Luganda proverbs and wisdom",
];

export function PodcastsView() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function loadPodcasts() {
    setLoading(true);
    try {
      const res = await fetch("/api/podcasts?language=luganda");
      setPodcasts(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { loadPodcasts(); }, []);

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/podcasts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, language: "luganda" }),
      });
      const data = await res.json();
      if (data.success) {
        setPodcasts((prev) => [data.podcast, ...prev]);
        setTopic("");
        setExpanded(data.podcast.id);
      }
    } catch { /* silent */ }
    finally { setGenerating(false); }
  }

  function playAudio(podcast: Podcast) {
    if (!podcast.audio_url) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (playing === podcast.id) {
      setPlaying(null);
      return;
    }
    const audio = new Audio(podcast.audio_url);
    audioRef.current = audio;
    audio.play();
    setPlaying(podcast.id);
    audio.onended = () => setPlaying(null);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Podcast Hub</h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>AI-generated Luganda learning episodes</p>
      </div>

      {/* Generate */}
      <div className="mb-8 p-5 rounded-2xl border border-white/10" style={{ background: "rgba(33,144,121,0.08)" }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: "var(--teal-light)" }}>✨ Generate a new episode</h2>
        <div className="flex gap-3 mb-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Enter a topic…"
            className="flex-1 px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 text-sm outline-none"
            style={{ color: "var(--cream)" }}
          />
          <button
            onClick={generate}
            disabled={generating || !topic.trim()}
            className="gb-btn gb-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((s) => (
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

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>Loading episodes…</div>
      )}

      {/* Generating overlay */}
      {generating && (
        <div className="mb-4 p-4 rounded-xl border border-teal-500/30 flex items-center gap-3" style={{ background: "rgba(33,144,121,0.08)" }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin shrink-0" style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--teal-light)" }}>Creating your episode…</p>
            <p className="text-xs opacity-60" style={{ color: "var(--cream)" }}>Writing script and generating audio</p>
          </div>
        </div>
      )}

      {/* Podcast list */}
      {!loading && podcasts.length === 0 && (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-5xl mb-4">🎧</div>
          <p className="text-sm">No episodes yet. Generate your first one above!</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {podcasts.map((pod) => (
          <div key={pod.id} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="p-5">
              <div className="flex items-start gap-3">
                {/* Play button */}
                <button
                  onClick={() => playAudio(pod)}
                  disabled={!pod.audio_url}
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ background: playing === pod.id ? "var(--orange)" : "var(--teal)", color: "var(--forest)" }}
                  title={pod.audio_url ? "Play / Pause" : "No audio available"}
                >
                  {playing === pod.id ? "⏸" : "▶"}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--cream)" }}>{pod.title}</h3>
                    {pod.is_ai_generated && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(33,144,121,0.2)", color: "var(--teal-light)" }}>AI</span>
                    )}
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed line-clamp-2" style={{ color: "var(--cream)" }}>{pod.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-40" style={{ color: "var(--cream)" }}>
                    <span>🎵 {pod.language}</span>
                    <span>👁 {pod.listens} listens</span>
                    <span>{new Date(pod.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(expanded === pod.id ? null : pod.id)}
                  className="shrink-0 text-xs opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: "var(--cream)" }}
                >
                  {expanded === pod.id ? "▲" : "▼"}
                </button>
              </div>
            </div>

            {/* Script */}
            {expanded === pod.id && pod.script && (
              <div className="px-5 pb-5 border-t border-white/10">
                <h4 className="text-xs font-semibold mb-2 mt-3 opacity-50" style={{ color: "var(--cream)" }}>TRANSCRIPT</h4>
                <p className="text-xs leading-relaxed opacity-70 whitespace-pre-line" style={{ color: "var(--cream)" }}>{pod.script}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
