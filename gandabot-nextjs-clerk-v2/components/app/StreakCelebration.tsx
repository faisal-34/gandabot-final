"use client";

/**
 * StreakCelebration — full-screen celebration overlay shown once per day
 * when the user opens the app and their streak advances.
 *
 * Auto-dismisses after 3 s. Tapping anywhere also dismisses.
 *
 * Props:
 *   streakDays  — current streak count after today's login
 *   xpAwarded   — XP awarded (always 20 for daily login)
 *   onDismiss   — callback to remove from DOM
 */

import { useEffect } from "react";

interface Props {
  streakDays: number;
  xpAwarded:  number;
  onDismiss:  () => void;
}

function flameSize(days: number): string {
  if (days >= 30) return "text-8xl";
  if (days >= 7)  return "text-7xl";
  return "text-6xl";
}

function milestone(days: number): string | null {
  if (days === 7)   return "🏆 One-week warrior!";
  if (days === 14)  return "💪 Two weeks strong!";
  if (days === 30)  return "🌟 30-day legend!";
  if (days === 100) return "👑 100-day master!";
  if (days % 10 === 0 && days > 0) return `🎉 ${days}-day milestone!`;
  return null;
}

export function StreakCelebration({ streakDays, xpAwarded, onDismiss }: Props) {
  // Auto-dismiss after 3 s
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const badge = milestone(streakDays);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-8 cursor-pointer select-none"
      style={{ background: "rgba(12,31,23,0.92)", backdropFilter: "blur(12px)" }}
      aria-live="assertive"
      role="alert"
    >
      {/* Flame */}
      <div
        className={`${flameSize(streakDays)} mb-4`}
        style={{ animation: "streak-pulse 0.6s ease-out" }}
      >
        🔥
      </div>

      {/* Day count */}
      <div
        className="text-6xl font-black mb-1"
        style={{ fontFamily: "Fraunces, serif", color: "var(--orange)" }}
      >
        {streakDays}
      </div>
      <p className="text-lg font-semibold mb-2" style={{ color: "var(--cream)" }}>
        {streakDays === 1 ? "Day streak started!" : `Day streak!`}
      </p>

      {/* Milestone badge */}
      {badge && (
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold mb-4"
          style={{ background: "rgba(244,123,32,0.2)", color: "var(--orange)", border: "1px solid rgba(244,123,32,0.4)" }}
        >
          {badge}
        </div>
      )}

      {/* XP pill */}
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold mb-8"
        style={{ background: "rgba(46,184,152,0.15)", color: "var(--teal-light)", border: "1px solid rgba(46,184,152,0.3)" }}
      >
        <span>⭐</span>
        <span>+{xpAwarded} XP</span>
      </div>

      <p className="text-xs opacity-30" style={{ color: "var(--cream)" }}>
        Tap anywhere to continue
      </p>

      {/* Keyframe */}
      <style>{`
        @keyframes streak-pulse {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
