"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { getXPLevel, XP_LEVELS } from "@/lib/xp";

/** Label of the level that starts at `min` XP, or "next level" */
function nextLevelLabel(nextMin: number): string {
  const idx = XP_LEVELS.findIndex((l) => l.min === nextMin);
  return XP_LEVELS[idx]?.label ?? "next level";
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Progress {
  lessons_done: number;
  streak_days:  number;
  xp:           number;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const BADGES = [
  { icon: "🌱", label: "First Step",   desc: "Complete your first lesson",  unlocked: (p: Progress) => p.lessons_done >= 1  },
  { icon: "🔥", label: "On Fire",      desc: "3-day streak",                unlocked: (p: Progress) => p.streak_days  >= 3  },
  { icon: "📚", label: "Bookworm",     desc: "10 lessons done",             unlocked: (p: Progress) => p.lessons_done >= 10 },
  { icon: "⭐", label: "Star Student", desc: "500 XP earned",               unlocked: (p: Progress) => p.xp           >= 500},
  { icon: "🏆", label: "Champion",     desc: "7-day streak",                unlocked: (p: Progress) => p.streak_days  >= 7  },
  { icon: "🎓", label: "Graduate",     desc: "50 lessons done",             unlocked: (p: Progress) => p.lessons_done >= 50 },
  { icon: "💎", label: "Diamond",      desc: "30-day streak",               unlocked: (p: Progress) => p.streak_days  >= 30 },
  { icon: "👑", label: "Master",       desc: "3,000 XP earned",             unlocked: (p: Progress) => p.xp           >= 3000},
];

// ─── Streak display helpers ───────────────────────────────────────────────────

function streakLabel(days: number): string {
  if (days === 0) return "No streak yet";
  if (days === 1) return "Day 1 — keep it going!";
  if (days < 7)  return `${days} days — great start!`;
  if (days < 30) return `${days} days — on fire! 🔥`;
  return `${days} days — legendary! 👑`;
}

function streakColor(days: number): string {
  if (days >= 30) return "#9B59B6"; // purple — legendary
  if (days >= 7)  return "#F47B20"; // orange — hot streak
  if (days >= 3)  return "#E67E22"; // warm orange
  return "var(--teal)";             // teal — just started
}

// ─── ProfileView ──────────────────────────────────────────────────────────────

export function ProfileView() {
  const { user } = useUser();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const loadProfile = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Progress) => {
        if (
          typeof data.lessons_done === "number" &&
          typeof data.streak_days  === "number" &&
          typeof data.xp           === "number"
        ) {
          setProgress(data);
        } else {
          throw new Error("Unexpected response shape");
        }
      })
      .catch(() => setError("Could not load your progress. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const level = progress ? getXPLevel(progress.xp) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* ── Header: avatar + name ─────────────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-4">
        {user?.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={`${user.fullName ?? "User"} avatar`}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full object-cover"
            priority
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            {user?.firstName?.[0] ?? "U"}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-black" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            {user?.fullName || user?.username || "Learner"}
          </h1>
          <p className="text-sm opacity-50 truncate" style={{ color: "var(--cream)" }}>
            {user?.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 mx-auto mb-3 animate-spin"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }}
          />
          <p className="text-sm opacity-40" style={{ color: "var(--cream)" }}>Loading progress…</p>
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          className="text-center py-12 px-6 rounded-2xl border border-orange-500/30"
          style={{ background: "rgba(244,123,32,0.06)" }}
        >
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm mb-4" style={{ color: "var(--orange)" }}>{error}</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 rounded-xl text-sm border border-orange-500/30 hover:border-orange-500 transition-colors"
            style={{ color: "var(--orange)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Progress ──────────────────────────────────────────────────────── */}
      {!loading && !error && progress && (
        <>
          {/* Streak hero card — the most motivating metric, shown prominently */}
          <div
            className="mb-5 p-5 rounded-2xl border flex items-center gap-5"
            style={{
              background:   `${streakColor(progress.streak_days)}18`,
              borderColor:  `${streakColor(progress.streak_days)}44`,
            }}
          >
            {/* Flame + count */}
            <div className="text-center shrink-0">
              <div
                className="text-4xl mb-0.5"
                style={{ filter: progress.streak_days === 0 ? "grayscale(1) opacity(0.3)" : "none" }}
              >
                🔥
              </div>
              <div
                className="text-3xl font-black leading-none"
                style={{ fontFamily: "Fraunces, serif", color: streakColor(progress.streak_days) }}
              >
                {progress.streak_days}
              </div>
              <div className="text-[10px] opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>
                {progress.streak_days === 1 ? "DAY" : "DAYS"}
              </div>
            </div>

            {/* Label + motivational copy */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-1" style={{ color: "var(--cream)" }}>
                Daily Streak
              </p>
              <p className="text-xs opacity-60 leading-relaxed" style={{ color: "var(--cream)" }}>
                {streakLabel(progress.streak_days)}
              </p>
              {progress.streak_days === 0 && (
                <p className="text-xs mt-1.5 font-medium" style={{ color: "var(--teal-light)" }}>
                  Come back tomorrow to start your streak! 💪
                </p>
              )}
              {progress.streak_days >= 7 && (
                <div
                  className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: `${streakColor(progress.streak_days)}28`, color: streakColor(progress.streak_days) }}
                >
                  {progress.streak_days >= 30 ? "👑 Legendary" : "🔥 Hot streak"}
                </div>
              )}
            </div>
          </div>

          {/* Level + XP bar */}
          <div
            className="mb-5 p-5 rounded-2xl border border-white/10"
            style={{ background: "rgba(33,144,121,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs opacity-50 block mb-0.5" style={{ color: "var(--cream)" }}>LEVEL</span>
                <span className="font-bold text-lg" style={{ color: "var(--teal-light)" }}>{level?.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs opacity-50 block mb-0.5" style={{ color: "var(--cream)" }}>TOTAL XP</span>
                <span className="font-bold text-lg" style={{ color: "var(--orange)" }}>
                  {progress.xp.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${level?.progress ?? 0}%`, background: "var(--teal)" }}
              />
            </div>
            {level?.nextMin && (
              <p className="text-xs opacity-40 mt-1.5" style={{ color: "var(--cream)" }}>
                {(level.nextMin - progress.xp).toLocaleString()} XP to {nextLevelLabel(level.nextMin)}
              </p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: "📖", label: "Lessons Done", value: progress.lessons_done.toLocaleString() },
              { icon: "⭐", label: "XP Earned",    value: progress.xp.toLocaleString() },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl border border-white/10 text-center"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div
                  className="text-2xl font-black mb-0.5"
                  style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div>
            <h2 className="font-semibold text-sm mb-4 opacity-70 tracking-widest" style={{ color: "var(--cream)" }}>
              ACHIEVEMENTS
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES.map((badge) => {
                const earned = badge.unlocked(progress);
                return (
                  <div
                    key={badge.label}
                    className="p-4 rounded-xl border transition-all text-center"
                    style={{
                      borderColor: earned ? "rgba(33,144,121,0.4)" : "rgba(255,255,255,0.08)",
                      background:  earned ? "rgba(33,144,121,0.1)" : "rgba(255,255,255,0.02)",
                      opacity:     earned ? 1 : 0.35,
                    }}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <div className="font-semibold text-xs mb-0.5" style={{ color: "var(--cream)" }}>
                      {badge.label}
                    </div>
                    <div className="text-[10px] opacity-50" style={{ color: "var(--cream)" }}>
                      {badge.desc}
                    </div>
                    {earned && (
                      <div className="mt-1.5 text-[10px] font-bold" style={{ color: "var(--teal-light)" }}>
                        ✓ Earned
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
