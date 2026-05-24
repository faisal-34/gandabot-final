"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";
import { Onboarding, useOnboardingDone } from "@/components/app/Onboarding";
import { StreakCelebration } from "@/components/app/StreakCelebration";
import { checkDailyStreak } from "@/lib/streak";
import { Analytics } from "@/lib/analytics";

// ─── Navigation data ──────────────────────────────────────────────────────────

const PRIMARY_NAV = [
  { href: "/app/learn",     icon: "📖", label: "Learn"     },
  { href: "/app/chat",      icon: "💬", label: "Chat"      },
  { href: "/app/voice",     icon: "🌐", label: "Translate" },
  { href: "/app/create",    icon: "🎬", label: "Clips"     },
  { href: "/app/profile",   icon: "👤", label: "Profile"   },
];

const MORE_NAV = [
  { href: "/app/community", icon: "👥", label: "Community" },
  { href: "/app/tutor",     icon: "🎙️", label: "Practice" },
  { href: "/app/explorer",  icon: "🌍", label: "Discover"  },
  { href: "/app/podcasts",  icon: "🎧", label: "Podcasts"  },
  { href: "/app/settings",  icon: "⚙️", label: "Settings"  },
];

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV];

// ─── Streak badge ─────────────────────────────────────────────────────────────
// Small flame + number shown in the sidebar and above the Profile nav tab.

function StreakBadge({ days, compact = false }: { days: number; compact?: boolean }) {
  if (days < 1) return null;
  return compact ? (
    // Tiny badge overlaid on the Profile icon in the mobile nav
    <span
      className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-[9px] font-black leading-none"
      style={{
        minWidth: "16px",
        height: "16px",
        background: "var(--orange)",
        color: "#fff",
        padding: "0 3px",
        border: "1.5px solid var(--forest)",
      }}
    >
      {days > 99 ? "99+" : days}
    </span>
  ) : (
    // Full badge in desktop sidebar footer
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: "rgba(244,123,32,0.15)", color: "var(--orange)" }}
    >
      <span>🔥</span>
      <span>{days} day{days !== 1 ? "s" : ""}</span>
    </div>
  );
}

// ─── More Drawer ──────────────────────────────────────────────────────────────

function MoreDrawer({
  open,
  onClose,
  activeHref,
}: {
  open: boolean;
  onClose: () => void;
  activeHref: string;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full rounded-t-3xl px-5 pt-4 pb-8"
        style={{ background: "#0C1F17", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.2)" }} />

        <p className="text-xs font-semibold tracking-widest mb-4 opacity-40" style={{ color: "var(--cream)" }}>
          MORE FEATURES
        </p>

        <div className="flex flex-col gap-1">
          {MORE_NAV.map((item) => {
            const active = activeHref === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
                style={{
                  background: active ? "rgba(33,144,121,0.18)" : "transparent",
                  color: active ? "var(--teal-light)" : "var(--cream)",
                }}
              >
                <span className="text-2xl leading-none w-8 text-center">{item.icon}</span>
                <div>
                  <p className="font-semibold text-sm leading-tight">{item.label}</p>
                  <p className="text-xs opacity-40 mt-0.5">
                    {item.href === "/app/community" && "Posts, discussions & leaderboard"}
                    {item.href === "/app/tutor"     && "Pronunciation drills & word practice"}
                    {item.href === "/app/explorer"  && "Explore African cultures & languages"}
                    {item.href === "/app/podcasts"  && "AI-generated learning episodes"}
                    {item.href === "/app/settings"  && "Preferences & account management"}
                  </p>
                </div>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)" }} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname        = usePathname();
  const [moreOpen, setMoreOpen]                 = useState(false);
  const onboardingDone  = useOnboardingDone();
  const [showOnboarding, setShowOnboarding]     = useState(false);
  const [streakDays,     setStreakDays]          = useState(0);
  const [celebration,    setCelebration]         = useState<{ days: number; xp: number } | null>(null);

  // ── Onboarding gate ──────────────────────────────────────────────────────
  useEffect(() => {
    setShowOnboarding(!onboardingDone);
  }, [onboardingDone]);

  // ── Daily streak check — runs once per calendar day ──────────────────────
  const runStreakCheck = useCallback(async () => {
    // Don't check streak while onboarding is visible — user hasn't authenticated yet
    if (!onboardingDone) return;

    // Track session start once per mount
    Analytics.appOpened();

    const result = await checkDailyStreak();

    if (result.streakDays > 0) {
      setStreakDays(result.streakDays);
    }

    if (result.isNewDay && result.streakDays > 0) {
      Analytics.streakExtended(result.streakDays, result.xpAwarded);
      // Small delay so the page is fully rendered before the overlay appears
      setTimeout(() => setCelebration({ days: result.streakDays, xp: result.xpAwarded }), 800);
    }
  }, [onboardingDone]);

  useEffect(() => {
    runStreakCheck();
  }, [runStreakCheck]);

  const moreIsActive = MORE_NAV.some((item) => item.href === pathname);

  function handleOnboardingComplete(_language: string) {
    setShowOnboarding(false);
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--forest)" }}>

      {/* ── Onboarding overlay ────────────────────────────────────────────── */}
      {showOnboarding && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* ── Streak celebration overlay ────────────────────────────────────── */}
      {celebration && (
        <StreakCelebration
          streakDays={celebration.days}
          xpAwarded={celebration.xp}
          onDismiss={() => setCelebration(null)}
        />
      )}

      {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 border-r border-white/10 shrink-0"
        style={{ background: "rgba(0,0,0,0.2)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            G
          </div>
          <span className="font-bold tracking-tight" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            GandaBot
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {ALL_NAV.map((item, i) => {
            const active      = pathname === item.href;
            const showDivider = i === PRIMARY_NAV.length;

            return (
              <div key={item.href}>
                {showDivider && (
                  <div className="flex items-center gap-2 px-3 pt-4 pb-2">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <span className="text-[10px] opacity-30 tracking-widest font-medium" style={{ color: "var(--cream)" }}>
                      MORE
                    </span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  </div>
                )}
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    background: active ? "rgba(33,144,121,0.18)" : "transparent",
                    color:      active ? "var(--teal-light)" : "var(--cream)",
                    opacity:    active ? 1 : 0.7,
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Sidebar footer — account + streak */}
        <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-3">
          {/* Streak badge */}
          {streakDays > 0 && (
            <div className="px-1">
              <StreakBadge days={streakDays} />
            </div>
          )}
          {/* User account */}
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs opacity-50" style={{ color: "var(--cream)" }}>Account</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 flex"
        style={{ background: "rgba(12,31,23,0.97)", backdropFilter: "blur(12px)" }}
      >
        {/* Primary 4 items */}
        {PRIMARY_NAV.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5"
              style={{ color: active ? "var(--teal-light)" : "var(--cream)", opacity: active ? 1 : 0.5 }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* Profile — with streak badge overlay when streak is active */}
        {(() => {
          const profile = PRIMARY_NAV[4];
          const active  = pathname === profile.href;
          return (
            <Link
              href={profile.href}
              className="flex-1 flex flex-col items-center py-2.5 gap-0.5 relative"
              style={{ color: active ? "var(--teal-light)" : "var(--cream)", opacity: active ? 1 : 0.5 }}
            >
              <span className="text-xl leading-none relative inline-block">
                {profile.icon}
                {streakDays > 0 && <StreakBadge days={streakDays} compact />}
              </span>
              <span className="text-[10px] font-medium mt-0.5">{profile.label}</span>
            </Link>
          );
        })()}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-opacity"
          style={{
            color:   moreIsActive ? "var(--teal-light)" : "var(--cream)",
            opacity: moreIsActive ? 1 : 0.5,
          }}
          aria-label="More features"
        >
          <span className="text-xl leading-none flex items-center justify-center gap-0.5">
            {moreIsActive
              ? (MORE_NAV.find((n) => n.href === pathname)?.icon ?? "⋯")
              : "⋯"}
          </span>
          <span className="text-[10px] font-medium mt-0.5">
            {moreIsActive
              ? (MORE_NAV.find((n) => n.href === pathname)?.label ?? "More")
              : "More"}
          </span>
        </button>
      </div>

      {/* More drawer */}
      <MoreDrawer
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        activeHref={pathname}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
