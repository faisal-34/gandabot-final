"use client";

/**
 * Onboarding — shown once to new users after sign-in.
 * 3 screens:
 *   1. Pick your primary language to learn
 *   2. Set your daily learning goal
 *   3. Quick feature tour (what the app can do)
 *
 * Completion state is persisted to localStorage so it only shows once.
 * On native (Capacitor) it uses @capacitor/preferences as the backend.
 */

import { useState, useEffect } from "react";
import { LANGUAGES } from "@/lib/languages";

// ─── Persistence ──────────────────────────────────────────────────────────────

const ONBOARDING_KEY = "gandabot_onboarding_done";
const GOAL_KEY = "gandabot_daily_goal";
const LANG_KEY = "gandabot_last_language";

function markDone(language: string, goal: string) {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
    localStorage.setItem(LANG_KEY, language);
    localStorage.setItem(GOAL_KEY, goal);
  } catch { /* storage full */ }
}

export function useOnboardingDone(): boolean {
  const [done, setDone] = useState(true); // default true → no flicker for returning users
  useEffect(() => {
    try {
      setDone(localStorage.getItem(ONBOARDING_KEY) === "1");
    } catch {
      setDone(true);
    }
  }, []);
  return done;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  { id: "casual",        emoji: "😌", label: "Just exploring",   desc: "No pressure — learn at my own pace" },
  { id: "conversational",emoji: "💬", label: "Conversational",   desc: "Hold basic conversations in 30 days" },
  { id: "fluent",        emoji: "🏆", label: "Fluency",          desc: "Full fluency — I'm committed" },
];

const FEATURES = [
  {
    icon: "💬",
    color: "#219079",
    title: "AI Chat",
    desc: "Ask anything in your chosen language — grammar, vocabulary, culture — and get instant answers.",
  },
  {
    icon: "🌐",
    color: "#F47B20",
    title: "Translate",
    desc: "Translate across 6 Ugandan languages with cultural context and audio playback.",
  },
  {
    icon: "🎙️",
    color: "#7056E4",
    title: "Practice",
    desc: "Drill your pronunciation with AI scoring and tips to improve.",
  },
  {
    icon: "🎬",
    color: "#E53E3E",
    title: "Clips",
    desc: "Watch and share short cultural clips from the GandaBot community.",
  },
];

// ─── Sub-screens ──────────────────────────────────────────────────────────────

function Screen1Language({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (code: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-5"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          G
        </div>
        <h1 className="text-2xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Nkusubiriza!
        </h1>
        <p className="text-sm leading-relaxed opacity-60" style={{ color: "var(--cream)" }}>
          Welcome to GandaBot. Which language would you like to learn first?
        </p>
      </div>

      {/* Language grid */}
      <div className="flex flex-col gap-2.5 flex-1">
        {LANGUAGES.map((lang) => {
          const FLAG: Record<string, string> = {
            lug: "🇺🇬", ach: "🇺🇬", teo: "🇺🇬", nyn: "🇺🇬", lgg: "🇺🇬", swh: "🌍",
          };
          const REGION: Record<string, string> = {
            lug: "Central Uganda · Baganda people",
            ach: "Northern Uganda · Acholi people",
            teo: "Eastern Uganda · Iteso people",
            nyn: "Western Uganda · Ankole people",
            lgg: "West Nile · Lugbara people",
            swh: "East Africa · widely spoken",
          };
          const active = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border text-left transition-all"
              style={{
                borderColor: active ? "var(--teal)" : "rgba(255,255,255,0.12)",
                background: active ? "rgba(33,144,121,0.15)" : "rgba(255,255,255,0.04)",
              }}
            >
              <span className="text-2xl leading-none shrink-0">{FLAG[lang.code]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: active ? "var(--teal-light)" : "var(--cream)" }}>
                  {lang.label}
                </p>
                <p className="text-xs opacity-50 truncate" style={{ color: "var(--cream)" }}>
                  {REGION[lang.code]}
                </p>
              </div>
              {active && (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--teal)" }}
                >
                  <svg className="w-3 h-3" fill="var(--forest)" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="mt-6 w-full py-4 rounded-2xl font-semibold text-sm disabled:opacity-30 transition-opacity"
        style={{ background: "var(--teal)", color: "var(--forest)" }}
      >
        Continue →
      </button>
    </div>
  );
}

function Screen2Goal({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col h-full px-6 py-8">
      <button onClick={onBack} className="self-start mb-6 text-sm opacity-40 hover:opacity-70 transition-opacity" style={{ color: "var(--cream)" }}>
        ← Back
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          What's your goal?
        </h2>
        <p className="text-sm opacity-60 leading-relaxed" style={{ color: "var(--cream)" }}>
          This helps us personalize your experience. You can change it any time.
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {GOALS.map((goal) => {
          const active = selected === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all"
              style={{
                borderColor: active ? "var(--teal)" : "rgba(255,255,255,0.12)",
                background: active ? "rgba(33,144,121,0.15)" : "rgba(255,255,255,0.04)",
              }}
            >
              <span className="text-3xl leading-none shrink-0">{goal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: active ? "var(--teal-light)" : "var(--cream)" }}>
                  {goal.label}
                </p>
                <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>
                  {goal.desc}
                </p>
              </div>
              {active && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--teal)" }}>
                  <svg className="w-3 h-3" fill="var(--forest)" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="mt-6 w-full py-4 rounded-2xl font-semibold text-sm disabled:opacity-30 transition-opacity"
        style={{ background: "var(--teal)", color: "var(--forest)" }}
      >
        Continue →
      </button>
    </div>
  );
}

function Screen3Tour({
  language,
  onFinish,
  onBack,
}: {
  language: string;
  onFinish: () => void;
  onBack: () => void;
}) {
  const langLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Luganda";

  return (
    <div className="flex flex-col h-full px-6 py-8">
      <button onClick={onBack} className="self-start mb-6 text-sm opacity-40 hover:opacity-70 transition-opacity" style={{ color: "var(--cream)" }}>
        ← Back
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-black mb-2" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Here's what you can do
        </h2>
        <p className="text-sm opacity-60" style={{ color: "var(--cream)" }}>
          Everything is ready for your {langLabel} journey.
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-4 px-4 py-4 rounded-2xl border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${f.color}22` }}
            >
              {f.icon}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--cream)" }}>{f.title}</p>
              <p className="text-xs leading-relaxed opacity-55" style={{ color: "var(--cream)" }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          Start learning {langLabel} 🇺🇬
        </button>
        <p className="text-center text-xs opacity-30 mt-3" style={{ color: "var(--cream)" }}>
          You can explore all features from the navigation below
        </p>
      </div>
    </div>
  );
}

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2 shrink-0">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? "20px" : "6px",
            height: "6px",
            background: i === current ? "var(--teal)" : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Onboarding component ────────────────────────────────────────────────

export function Onboarding({ onComplete }: { onComplete: (language: string) => void }) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState("lug");
  const [goal, setGoal] = useState("conversational");

  function finish() {
    markDone(language, goal);
    onComplete(language);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--forest)" }}
    >
      <ProgressDots current={step} total={3} />

      <div className="flex-1 overflow-y-auto">
        {step === 0 && (
          <Screen1Language
            selected={language}
            onSelect={setLanguage}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <Screen2Goal
            selected={goal}
            onSelect={setGoal}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <Screen3Tour
            language={language}
            onFinish={finish}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}
