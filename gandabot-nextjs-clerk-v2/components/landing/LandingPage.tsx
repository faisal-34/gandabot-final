"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const FEATURES = [
  {
    icon: "💬",
    title: "AI Chat Tutor",
    desc: "Conversational practice with GandaBot — your expert Luganda companion available 24/7.",
    href: "/app/chat",
  },
  {
    icon: "🎙️",
    title: "Pronunciation Coach",
    desc: "Get instant scored feedback on your Luganda pronunciation with actionable tips.",
    href: "/app/tutor",
  },
  {
    icon: "🌍",
    title: "Country Explorer",
    desc: "Discover Uganda and East Africa — culture, language, currency, and local phrases.",
    href: "/app/explorer",
  },
  {
    icon: "🎧",
    title: "Podcast Hub",
    desc: "AI-generated audio lessons on Luganda topics, narrated in natural speech.",
    href: "/app/podcasts",
  },
  {
    icon: "🗣️",
    title: "Voice Assistant",
    desc: "Real-time translation and cultural context for any English or Luganda phrase.",
    href: "/app/voice",
  },
  {
    icon: "👥",
    title: "Community Forum",
    desc: "Connect with fellow learners, share tips, and get AI-assisted replies.",
    href: "/app/community",
  },
];

const PHRASES = [
  "Oli otya? — How are you?",
  "Webale nyo — Thank you very much",
  "Wasuze otya? — Good morning",
  "Nsanyuse nnyo — I am very happy",
  "Mpulira — I understand",
  "Erinnya lyange — My name is",
  "Ndi mwangu — I am fine",
  "Tugende — Let's go",
];

export function LandingPage() {
  const { isSignedIn } = useUser();
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubStatus(res.ok ? "done" : "error");
    } catch {
      setSubStatus("error");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--forest)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm" style={{ background: "rgba(12,31,23,0.9)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold gb-spin" style={{ background: "var(--teal)", color: "var(--forest)" }}>G</div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>GandaBot</span>
        </div>
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link href="/app/chat" className="gb-btn gb-btn-primary px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--teal)", color: "var(--forest)" }}>
              Open App
            </Link>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="gb-btn px-4 py-2 rounded-lg text-sm font-medium border border-white/20" style={{ color: "var(--cream)" }}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="gb-btn gb-btn-primary px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--teal)", color: "var(--forest)" }}>Get Started</button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 text-center gb-kente">
        <div className="gb-spin absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ background: "var(--teal)" }} />
        <div className="gb-float absolute -bottom-10 -left-16 w-48 h-48 rounded-full opacity-10" style={{ background: "var(--orange)" }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="gb-rise-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border" style={{ borderColor: "var(--teal)", color: "var(--teal)" }}>
            ✦ AI-Powered Luganda Learning
          </div>
          <h1 className="gb-rise-2 text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: "Fraunces, serif" }}>
            <span style={{ color: "var(--cream)" }}>Learn </span>
            <span className="gb-shimmer-text">Luganda</span>
            <br />
            <span style={{ color: "var(--cream)" }}>with AI</span>
          </h1>
          <p className="gb-rise-3 text-lg mb-10 max-w-xl mx-auto opacity-80" style={{ color: "var(--cream)" }}>
            Master Luganda and explore Ugandan culture through AI-powered conversation, pronunciation coaching, podcasts, and community learning.
          </p>
          <div className="gb-rise-4 flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/app/chat" className="gb-btn gb-btn-primary px-8 py-4 rounded-xl font-semibold text-base" style={{ background: "var(--teal)", color: "var(--forest)" }}>
                Start Learning →
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="gb-btn gb-btn-primary px-8 py-4 rounded-xl font-semibold text-base" style={{ background: "var(--teal)", color: "var(--forest)" }}>
                    Start for Free →
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="gb-btn px-8 py-4 rounded-xl font-semibold text-base border border-white/20" style={{ color: "var(--cream)" }}>
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Scrolling phrases marquee */}
      <div className="gb-marquee-wrap overflow-hidden border-y border-white/10 py-3" style={{ background: "rgba(33,144,121,0.08)" }}>
        <div className="gb-marquee-inner flex gap-12 whitespace-nowrap" style={{ width: "max-content" }}>
          {[...PHRASES, ...PHRASES].map((p, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: "var(--teal-light)" }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            Everything you need to learn Luganda
          </h2>
          <p className="opacity-60 max-w-xl mx-auto" style={{ color: "var(--cream)" }}>
            Six powerful modules designed around how language learning actually works.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`gb-feature-card rounded-2xl p-6 border border-white/10 gb-rise-${Math.min(i + 1, 5)}`} style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--cream)" }}>{f.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed" style={{ color: "var(--cream)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 border-y border-white/10" style={{ background: "rgba(33,144,121,0.06)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[["6", "Learning Modules"], ["AI-Powered", "All Features"], ["Uganda", "Focused"]].map(([val, label]) => (
            <div key={label}>
              <div className="text-4xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--teal-light)" }}>{val}</div>
              <div className="text-sm opacity-60" style={{ color: "var(--cream)" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-6 py-24 max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Stay in the loop</h2>
        <p className="opacity-60 mb-8 text-sm" style={{ color: "var(--cream)" }}>Weekly Luganda phrases, cultural insights, and platform updates.</p>
        {subStatus === "done" ? (
          <div className="py-4 px-6 rounded-xl text-sm font-medium" style={{ background: "rgba(33,144,121,0.2)", color: "var(--teal-light)" }}>
            Mwandiikibirwa! You're subscribed ✓
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none focus:border-teal-500"
              style={{ color: "var(--cream)" }}
            />
            <button
              type="submit"
              disabled={subStatus === "loading"}
              className="gb-btn gb-btn-primary px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "var(--teal)", color: "var(--forest)" }}
            >
              {subStatus === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {subStatus === "error" && <p className="text-xs mt-2 opacity-60" style={{ color: "var(--orange)" }}>Something went wrong. Please try again.</p>}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--teal)", color: "var(--forest)" }}>G</div>
          <span className="font-bold" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>GandaBot</span>
        </div>
        <p className="text-xs opacity-40" style={{ color: "var(--cream)" }}>
          AI-powered Luganda learning. Built with ❤️ for Uganda and the world.
        </p>
      </footer>
    </div>
  );
}
