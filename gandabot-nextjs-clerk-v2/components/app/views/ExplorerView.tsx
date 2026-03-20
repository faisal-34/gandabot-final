"use client";

import { useState } from "react";

interface CountryInfo {
  overview: string;
  capital: string;
  currency: string;
  language: string;
  culture: string;
  phrases: string;
}

const AFRICAN_COUNTRIES = [
  "Uganda", "Kenya", "Tanzania", "Rwanda", "Ethiopia", "Ghana",
  "Nigeria", "South Africa", "Egypt", "Morocco", "Senegal", "Zimbabwe",
  "Cameroon", "Ivory Coast", "Mozambique", "Madagascar",
];

export function ExplorerView() {
  const [country, setCountry] = useState("Uganda");
  const [info, setInfo] = useState<CountryInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explore(name?: string) {
    const target = name || country;
    setLoading(true);
    setError("");
    setInfo(null);
    try {
      const res = await fetch(`/api/country-explorer/info?country=${encodeURIComponent(target)}`);
      if (!res.ok) throw new Error("Failed");
      setInfo(await res.json());
    } catch {
      setError("Could not load country information. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function selectCountry(name: string) {
    setCountry(name);
    explore(name);
  }

  const cards = info
    ? [
        { icon: "🏛️", label: "Capital", value: info.capital },
        { icon: "💱", label: "Currency", value: info.currency },
        { icon: "🗣️", label: "Languages", value: info.language },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Country Explorer</h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Discover African cultures, languages, and traditions</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && explore()}
          placeholder="Enter an African country…"
          className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none"
          style={{ color: "var(--cream)" }}
        />
        <button
          onClick={() => explore()}
          disabled={loading || !country.trim()}
          className="gb-btn gb-btn-primary px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-40"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          {loading ? "…" : "Explore"}
        </button>
      </div>

      {/* Quick-select chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {AFRICAN_COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => selectCountry(c)}
            className="px-3 py-1.5 rounded-full text-xs border transition-colors"
            style={{
              borderColor: country === c && info ? "var(--teal)" : "rgba(255,255,255,0.2)",
              background: country === c && info ? "rgba(33,144,121,0.15)" : "transparent",
              color: country === c && info ? "var(--teal-light)" : "var(--cream)",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto mb-4 animate-spin" style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }} />
          <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>Exploring {country}…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 px-6 rounded-2xl border border-orange-500/30" style={{ background: "rgba(244,123,32,0.08)", color: "var(--orange)" }}>
          {error}
        </div>
      )}

      {/* Result */}
      {info && !loading && (
        <div className="gb-rise-1">
          {/* Country name + overview */}
          <div className="mb-6 p-6 rounded-2xl border border-white/10" style={{ background: "rgba(33,144,121,0.08)" }}>
            <h2 className="text-2xl font-black mb-3" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
              🌍 {country}
            </h2>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: "var(--cream)" }}>{info.overview}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {cards.map((card) => (
              <div key={card.label} className="p-4 rounded-xl border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="text-xs opacity-50 mb-1" style={{ color: "var(--cream)" }}>{card.label}</div>
                <div className="text-xs font-medium leading-tight" style={{ color: "var(--cream)" }}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Culture */}
          <div className="mb-4 p-5 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: "var(--teal-light)" }}>
              🎭 Culture
            </h3>
            <p className="text-sm opacity-80 leading-relaxed" style={{ color: "var(--cream)" }}>{info.culture}</p>
          </div>

          {/* Phrases */}
          <div className="p-5 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--orange)" }}>
              💬 Common Phrases
            </h3>
            <div className="flex flex-col gap-2">
              {info.phrases.split("•").filter(Boolean).map((phrase, i) => (
                <div key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--cream)" }}>
                  <span style={{ color: "var(--teal)", marginTop: "2px" }}>•</span>
                  <span className="opacity-80">{phrase.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!info && !loading && !error && (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>
          <div className="text-5xl mb-4">🌍</div>
          <p className="text-sm">Select a country to explore its culture, language, and phrases.</p>
        </div>
      )}
    </div>
  );
}
