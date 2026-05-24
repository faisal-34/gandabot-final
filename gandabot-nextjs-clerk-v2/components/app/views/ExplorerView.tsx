"use client";

/**
 * ExplorerView — Discover African cultures, languages, and traditions.
 *
 * Data is served from /api/country-explorer/info which pulls from
 * lib/countries.ts — a curated static dataset with accurate facts for
 * 16 African countries. No AI generation, no external API calls.
 */

import { useState, useRef, useEffect } from "react";
import type { CountryData, Phrase } from "@/lib/countries";
import { COUNTRY_NAMES } from "@/lib/countries";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      className="p-4 rounded-2xl border border-white/10 flex flex-col gap-1.5"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[10px] font-bold tracking-widest opacity-40 uppercase" style={{ color: "var(--cream)" }}>
        {label}
      </span>
      <span className="text-xs font-medium leading-snug" style={{ color: "var(--cream)" }}>
        {value}
      </span>
    </div>
  );
}

function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <div
      className="px-4 py-3 rounded-2xl border border-white/8 flex items-start gap-3"
      style={{ background: "rgba(33,144,121,0.06)" }}
    >
      <span className="text-sm shrink-0 mt-0.5" style={{ color: "var(--teal)" }}>•</span>
      <div className="min-w-0">
        <p className="font-bold text-sm leading-tight" style={{ color: "var(--teal-light)", fontFamily: "Fraunces, serif" }}>
          {phrase.phrase}
        </p>
        <p className="text-xs opacity-60 mt-0.5" style={{ color: "var(--cream)" }}>
          {phrase.meaning}
        </p>
      </div>
    </div>
  );
}

function FoodPill({ name }: { name: string }) {
  // Split on "(" to separate the main name from the description
  const [main, desc] = name.split("(");
  return (
    <div
      className="px-3 py-2 rounded-xl border border-white/10 text-xs"
      style={{ background: "rgba(255,255,255,0.04)", color: "var(--cream)" }}
    >
      <span className="font-semibold">{main.trim()}</span>
      {desc && (
        <span className="opacity-50 block mt-0.5">({desc.replace(")", "").trim()})</span>
      )}
    </div>
  );
}

function LandmarkRow({ name, index }: { name: string; index: number }) {
  const isUNESCO = name.includes("(UNESCO)");
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/6 last:border-0">
      <span className="text-base shrink-0 mt-0.5">📍</span>
      <span className="text-sm leading-snug flex-1" style={{ color: "var(--cream)", opacity: 0.85 }}>
        {name.replace(" (UNESCO)", "")}
      </span>
      {isUNESCO && (
        <span
          className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide"
          style={{ background: "rgba(244,123,32,0.15)", color: "var(--orange)" }}
        >
          UNESCO
        </span>
      )}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function ExplorerView() {
  const [selected,  setSelected]  = useState("Uganda");
  const [inputVal,  setInputVal]  = useState("");
  const [info,      setInfo]      = useState<CountryData | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Auto-load Uganda on first mount
  useEffect(() => {
    loadCountry("Uganda");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up in-flight requests on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  async function loadCountry(name: string) {
    const target = name.trim();
    if (!target) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setInfo(null);
    setSelected(target);

    try {
      const res = await fetch(
        `/api/country-explorer/info?country=${encodeURIComponent(target)}`,
        { signal: controller.signal },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data: CountryData = await res.json();
      setInfo(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Could not load country data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit() {
    const target = inputVal.trim();
    if (!target) return;
    loadCountry(target);
    setInputVal("");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
          style={{ background: "rgba(33,144,121,0.15)", color: "var(--teal-light)" }}
        >
          🌍 Discover Africa
        </div>
        <h1
          className="text-2xl font-black mb-1"
          style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
        >
          Country Explorer
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          Cultures, languages, foods &amp; landmarks — curated real data
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          placeholder="Type a country name…"
          className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none focus:border-white/40 transition-colors"
          style={{ color: "var(--cream)" }}
        />
        <button
          onClick={handleSearchSubmit}
          disabled={loading || !inputVal.trim()}
          className="px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          Go
        </button>
      </div>

      {/* ── Country chips ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-7">
        {COUNTRY_NAMES.map((name) => {
          const active = selected === name && !!info;
          return (
            <button
              key={name}
              onClick={() => loadCountry(name)}
              className="px-3 py-1.5 rounded-full text-xs border transition-all"
              style={{
                borderColor: active ? "var(--teal)"              : "rgba(255,255,255,0.18)",
                background:  active ? "rgba(33,144,121,0.18)"    : "transparent",
                color:       active ? "var(--teal-light)"        : "var(--cream)",
                opacity:     active ? 1                          : 0.65,
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-16">
          <div
            className="w-10 h-10 rounded-full border-2 mx-auto mb-4 animate-spin"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }}
          />
          <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
            Loading {selected}…
          </p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          className="text-center py-8 px-6 rounded-2xl border border-orange-500/30"
          style={{ background: "rgba(244,123,32,0.08)", color: "var(--orange)" }}
        >
          <p className="font-semibold mb-1">Couldn't load data</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {/* ── Result ──────────────────────────────────────────────────────── */}
      {info && !loading && (
        <div className="flex flex-col gap-5">

          {/* Hero card */}
          <div
            className="p-5 rounded-3xl border border-white/10"
            style={{ background: "rgba(33,144,121,0.08)" }}
          >
            <div className="flex items-start gap-4">
              <span className="text-5xl leading-none shrink-0">{info.flag}</span>
              <div className="flex-1 min-w-0">
                <h2
                  className="text-xl font-black leading-tight mb-0.5"
                  style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
                >
                  {info.name}
                </h2>
                <p className="text-xs font-semibold italic opacity-60 mb-2" style={{ color: "var(--teal-light)" }}>
                  {info.tagline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(33,144,121,0.2)", color: "var(--teal-light)" }}
                  >
                    👥 {info.population}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(255,255,255,0.08)", color: "var(--cream)" }}
                  >
                    🏛️ {info.capital}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="💱" label="Currency"  value={info.currency} />
            <StatCard icon="🗣️" label="Languages" value={info.language} />
          </div>

          {/* Overview */}
          <div
            className="p-5 rounded-2xl border border-white/10"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <h3
              className="text-xs font-bold tracking-widest mb-3 opacity-40"
              style={{ color: "var(--cream)" }}
            >
              OVERVIEW
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cream)", opacity: 0.85 }}>
              {info.overview}
            </p>
          </div>

          {/* Culture */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background:  "rgba(244,123,32,0.05)",
              borderColor: "rgba(244,123,32,0.18)",
            }}
          >
            <h3
              className="text-xs font-bold tracking-widest mb-3"
              style={{ color: "var(--orange)", opacity: 0.7 }}
            >
              🎭 CULTURE &amp; TRADITIONS
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--cream)", opacity: 0.85 }}>
              {info.culture}
            </p>
          </div>

          {/* Phrases */}
          <div>
            <h3
              className="text-xs font-bold tracking-widest mb-3 px-1 opacity-40"
              style={{ color: "var(--cream)" }}
            >
              💬 PHRASES IN {info.phraseLang.toUpperCase()}
            </h3>
            <div className="flex flex-col gap-2">
              {info.phrases.map((p, i) => (
                <PhraseCard key={i} phrase={p} />
              ))}
            </div>
          </div>

          {/* Foods */}
          <div>
            <h3
              className="text-xs font-bold tracking-widest mb-3 px-1 opacity-40"
              style={{ color: "var(--cream)" }}
            >
              🍽️ LOCAL FOODS
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {info.foods.map((food, i) => (
                <FoodPill key={i} name={food} />
              ))}
            </div>
          </div>

          {/* Landmarks */}
          <div
            className="p-5 rounded-2xl border border-white/10"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <h3
              className="text-xs font-bold tracking-widest mb-2 opacity-40"
              style={{ color: "var(--cream)" }}
            >
              🗺️ LANDMARKS &amp; MUST-SEES
            </h3>
            <div>
              {info.landmarks.map((lm, i) => (
                <LandmarkRow key={i} name={lm} index={i} />
              ))}
            </div>
          </div>

          {/* Fun fact */}
          <div
            className="p-5 rounded-2xl border"
            style={{
              background:  "rgba(33,144,121,0.08)",
              borderColor: "rgba(33,144,121,0.25)",
            }}
          >
            <p
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: "var(--teal-light)", opacity: 0.7 }}
            >
              ✨ DID YOU KNOW?
            </p>
            <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--cream)", opacity: 0.9 }}>
              {info.funFact}
            </p>
          </div>

        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!info && !loading && !error && (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-5xl mb-4">🌍</div>
          <p className="text-sm">Select a country above to explore its culture, language, and more.</p>
        </div>
      )}
    </div>
  );
}
