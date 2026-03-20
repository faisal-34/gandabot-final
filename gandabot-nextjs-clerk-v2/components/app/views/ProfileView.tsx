"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

interface Progress {
  lessons_done: number;
  streak_days: number;
  xp: number;
}

const XP_LEVELS = [
  { label: "Beginner", min: 0 },
  { label: "Learner", min: 100 },
  { label: "Student", min: 300 },
  { label: "Fluent", min: 700 },
  { label: "Expert", min: 1500 },
  { label: "Master", min: 3000 },
];

function getLevel(xp: number) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].min) {
      const next = XP_LEVELS[i + 1];
      const progress = next ? ((xp - XP_LEVELS[i].min) / (next.min - XP_LEVELS[i].min)) * 100 : 100;
      return { label: XP_LEVELS[i].label, progress: Math.min(progress, 100), nextXp: next?.min };
    }
  }
  return { label: "Beginner", progress: 0, nextXp: 100 };
}

const BADGES = [
  { icon: "🌱", label: "First Step", desc: "Start your journey", unlocked: (p: Progress) => p.lessons_done >= 1 },
  { icon: "🔥", label: "On Fire", desc: "3-day streak", unlocked: (p: Progress) => p.streak_days >= 3 },
  { icon: "📚", label: "Bookworm", desc: "10 lessons done", unlocked: (p: Progress) => p.lessons_done >= 10 },
  { icon: "⭐", label: "Star Student", desc: "500 XP earned", unlocked: (p: Progress) => p.xp >= 500 },
  { icon: "🏆", label: "Champion", desc: "7-day streak", unlocked: (p: Progress) => p.streak_days >= 7 },
  { icon: "🎓", label: "Graduate", desc: "50 lessons done", unlocked: (p: Progress) => p.lessons_done >= 50 },
];

export function ProfileView() {
  const { user } = useUser();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => { setProgress(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const level = progress ? getLevel(progress.xp) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "var(--teal)", color: "var(--forest)" }}>
            {user?.firstName?.[0] || "U"}
          </div>
        )}
        <div>
          <h1 className="text-xl font-black" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            {user?.fullName || user?.username || "Learner"}
          </h1>
          <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>Loading progress…</div>
      ) : progress ? (
        <>
          {/* Level + XP bar */}
          <div className="mb-6 p-5 rounded-2xl border border-white/10" style={{ background: "rgba(33,144,121,0.08)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs opacity-50 block mb-0.5" style={{ color: "var(--cream)" }}>LEVEL</span>
                <span className="font-bold text-lg" style={{ color: "var(--teal-light)" }}>{level?.label}</span>
              </div>
              <div className="text-right">
                <span className="text-xs opacity-50 block mb-0.5" style={{ color: "var(--cream)" }}>TOTAL XP</span>
                <span className="font-bold text-lg" style={{ color: "var(--orange)" }}>{progress.xp.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${level?.progress}%`, background: "var(--teal)" }}
              />
            </div>
            {level?.nextXp && (
              <p className="text-xs opacity-40 mt-1.5" style={{ color: "var(--cream)" }}>
                {level.nextXp - progress.xp} XP to next level
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: "📖", label: "Lessons Done", value: progress.lessons_done },
              { icon: "🔥", label: "Day Streak", value: progress.streak_days },
              { icon: "⭐", label: "XP Earned", value: progress.xp },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl border border-white/10 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black mb-0.5" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>{stat.value}</div>
                <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div>
            <h2 className="font-semibold text-sm mb-4 opacity-70" style={{ color: "var(--cream)" }}>ACHIEVEMENTS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BADGES.map((badge) => {
                const earned = badge.unlocked(progress);
                return (
                  <div
                    key={badge.label}
                    className="p-4 rounded-xl border transition-all"
                    style={{
                      borderColor: earned ? "rgba(33,144,121,0.4)" : "rgba(255,255,255,0.08)",
                      background: earned ? "rgba(33,144,121,0.1)" : "rgba(255,255,255,0.02)",
                      opacity: earned ? 1 : 0.4,
                    }}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <div className="font-semibold text-xs mb-0.5" style={{ color: "var(--cream)" }}>{badge.label}</div>
                    <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>{badge.desc}</div>
                    {earned && <div className="mt-1.5 text-[10px] font-medium" style={{ color: "var(--teal-light)" }}>✓ Earned</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>Could not load progress.</div>
      )}
    </div>
  );
}
