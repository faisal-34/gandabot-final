"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import {
  MessageSquare, Globe, BookOpen, Volume2, Users, Headphones,
  ArrowRight, ArrowDown, ChevronRight,
} from "lucide-react";

/* ─────────────────── data ─────────────────── */
const SLIDES = [
  { url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=80", label: "Buganda Kingdom" },
  { url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1600&q=80", label: "East Africa" },
  { url: "/hero-kampala.jpg", label: "Bulange, Mengo" },
];

const TICKER = [
  "Oli otya? — How are you?",
  "Webale nyo — Thank you very much",
  "Wasuze otya? — Good morning",
  "Mpozzi okumanya — Nice to meet you",
  "Mukama akuume — God bless you",
  "Oyogera Luganda? — Do you speak Luganda?",
  "Nsanyuse nnyo — I am very happy",
  "Mmwe muli balungi — You are beautiful people",
];

const STATS = [
  { n: "6",    label: "Ugandan Languages",  color: "#219079" },
  { n: "4",    label: "AI Learning Tools",  color: "#F47B20" },
  { n: "24/7", label: "AI Assistance",      color: "#7056E4" },
  { n: "Free", label: "To Get Started",     color: "#2EB898" },
];

const FEATURES = [
  { icon: MessageSquare, title: "AI Chat Assistant",   desc: "Bilingual AI that teaches Luganda with cultural context, pronunciation guides, and real conversation practice.", color: "#219079" },
  { icon: Globe,         title: "Country Explorer",    desc: "Discover Uganda and African countries with AI-generated insights, landmarks, maps, and cultural deep-dives.", color: "#F47B20" },
  { icon: BookOpen,      title: "Pronunciation Tutor", desc: "Perfect your Luganda pronunciation with AI-powered feedback, phonetic guides, and personalized drills.", color: "#7056E4" },
  { icon: Volume2,       title: "Voice Assistant",     desc: "Practice live conversations and get real-time voice translations for travel and daily interactions.", color: "#E53E3E" },
  { icon: Users,         title: "Community Forum",     desc: "Connect with fellow learners, share progress, and get AI-powered discussion summaries and reply suggestions.", color: "#38B2AC" },
  { icon: Headphones,    title: "Podcast Hub",         desc: "Generate and stream AI-crafted multilingual podcasts tailored to your level and learning interests.", color: "#805AD5" },
];

/* ─────────────────── Header ─────────────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(12,31,23,0.95)" : "rgba(12,31,23,0.6)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled ? "1px solid rgba(33,144,121,0.2)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <Image src="/gandabot-logo-ui.png" alt="GandaBot" width={44} height={44} className="rounded-lg" priority />
          <span style={{ fontFamily: "Fraunces,Georgia,serif", fontWeight: 700, color: "#F5EDD8" }}>GandaBot</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[["Blog", "/blog"], ["FAQ", "/faq"]].map(([label, href]) => (
            <a key={href} href={href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(245,237,216,0.55)" }}>{label}</a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <a href="/app" className="gb-btn gb-btn-primary px-5 py-2.5 rounded-full font-semibold text-sm" style={{ background: "#219079", color: "#fff" }}>
              Open App
            </a>
            <UserButton appearance={{ variables: { colorPrimary: "#219079" } }} />
          </SignedIn>
          <ClerkLoading>
            <a href="/sign-in" className="text-sm hover:text-white transition-colors" style={{ color: "rgba(245,237,216,0.55)" }}>
              Sign In
            </a>
            <a href="/sign-up" className="gb-btn gb-btn-primary px-5 py-2.5 rounded-full font-semibold text-sm" style={{ background: "#219079", color: "#fff" }}>
              Get Started
            </a>
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignInButton mode="redirect" fallbackRedirectUrl="/app">
                <button className="text-sm hover:text-white transition-colors" style={{ color: "rgba(245,237,216,0.55)" }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" fallbackRedirectUrl="/app">
                <button className="gb-btn gb-btn-primary px-5 py-2.5 rounded-full font-semibold text-sm" style={{ background: "#219079", color: "#fff" }}>
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
          </ClerkLoaded>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} style={{ color: "rgba(245,237,216,0.7)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-3 border-t" style={{ borderColor: "rgba(33,144,121,0.12)", background: "rgba(12,31,23,0.98)" }}>
          <a href="/blog" className="py-2 text-sm" style={{ color: "rgba(245,237,216,0.65)" }}>Blog</a>
          <a href="/faq"  className="py-2 text-sm" style={{ color: "rgba(245,237,216,0.65)" }}>FAQ</a>
          <ClerkLoading>
            <a href="/sign-in" className="py-2 text-sm text-left" style={{ color: "rgba(245,237,216,0.65)" }}>Sign In</a>
            <a href="/sign-up" className="py-2 text-sm text-left" style={{ color: "rgba(245,237,216,0.65)" }}>Sign Up</a>
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignInButton mode="redirect" fallbackRedirectUrl="/app">
                <button className="py-2 text-sm text-left" style={{ color: "rgba(245,237,216,0.65)" }}>Sign In</button>
              </SignInButton>
              <SignUpButton mode="redirect" fallbackRedirectUrl="/app">
                <button className="py-2 text-sm text-left" style={{ color: "rgba(245,237,216,0.65)" }}>Sign Up</button>
              </SignUpButton>
            </SignedOut>
          </ClerkLoaded>
        </div>
      )}
    </header>
  );
}

/* ─────────────────── Hero ─────────────────── */
function Hero() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#0C1F17" }}>
      {/* Slides */}
      <div className="absolute inset-0">
        {SLIDES.map((s, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === slide ? 1 : 0 }}>
            <Image src={s.url} alt={s.label} fill className="object-cover" priority={i === 0} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(12,31,23,0.94) 0%,rgba(12,31,23,0.7) 55%,rgba(12,31,23,0.9) 100%)" }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 gb-kente opacity-50 pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(to bottom,#219079,#F47B20,transparent)" }} />

      {/* Orbit decoration */}
      <div className="absolute gb-float pointer-events-none" style={{ top: "12%", right: "6%", width: 340, height: 340 }}>
        <div className="w-full h-full rounded-full gb-spin" style={{ border: "1.5px dashed rgba(33,144,121,0.3)" }} />
        <div className="absolute rounded-full" style={{ inset: 50, border: "1px solid rgba(244,123,32,0.2)" }} />
        <div className="absolute rounded-full" style={{ inset: 100, background: "rgba(33,144,121,0.07)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 pt-28 pb-16 max-w-7xl mx-auto w-full">
        <div className="gb-rise-1 mb-8 inline-flex w-fit">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ background: "rgba(33,144,121,0.18)", color: "#2EB898", border: "1px solid rgba(33,144,121,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2EB898", boxShadow: "0 0 6px #2EB898" }} />
            AI-Powered African Language Learning
          </span>
        </div>

        <h1 className="gb-rise-2 font-black leading-none mb-6" style={{ fontFamily: "Fraunces,Georgia,serif", fontSize: "clamp(3rem,8vw,7rem)", letterSpacing: "-0.02em" }}>
          <span style={{ color: "#F5EDD8" }}>Speak</span>{" "}
          <span className="gb-shimmer-text">Luganda.</span>
          <br />
          <span style={{ color: "#F5EDD8" }}>Feel</span>{" "}
          <em style={{ fontStyle: "italic", color: "#F47B20" }}>Uganda.</em>
        </h1>

        <p className="gb-rise-3 text-lg md:text-xl max-w-lg leading-relaxed mb-10" style={{ color: "rgba(245,237,216,0.68)", fontWeight: 300 }}>
          Immerse yourself in the richness of Luganda with your AI companion — natural conversations, cultural deep-dives, and a community of African language lovers.
        </p>

        <div className="gb-rise-4 flex flex-col sm:flex-row gap-4">
          <SignedIn>
            <a href="/app" className="gb-btn gb-btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base" style={{ background: "#219079", color: "#fff" }}>
              <ArrowDown size={18} /> Go to App
            </a>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="redirect" fallbackRedirectUrl="/app">
              <button className="gb-btn gb-btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-base" style={{ background: "#219079", color: "#fff" }}>
                <ArrowDown size={18} /> Start Learning Free
              </button>
            </SignUpButton>
            <SignInButton mode="redirect" fallbackRedirectUrl="/app">
              <button className="gb-btn inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-base border" style={{ borderColor: "rgba(245,237,216,0.25)", color: "rgba(245,237,216,0.7)" }}>
                Sign In <ArrowRight size={16} />
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <div className="gb-rise-5 mt-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#219079","#F47B20","#7056E4","#38B2AC"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2" style={{ background: c, borderColor: "#0C1F17" }} />
            ))}
          </div>
          <p style={{ color: "rgba(245,237,216,0.45)", fontSize: "0.82rem" }}>
            <strong style={{ color: "rgba(245,237,216,0.85)" }}>50,000+</strong> learners across 80 countries
          </p>
        </div>
      </div>

      {/* Slide dots */}
      <div className="relative z-10 flex justify-center gap-2 pb-6">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)} className="rounded-full transition-all duration-300"
            style={{ width: i === slide ? 28 : 8, height: 8, background: i === slide ? "#219079" : "rgba(245,237,216,0.3)" }} />
        ))}
      </div>

      {/* Partnership bar */}
      <div className="relative z-10 mx-6 md:mx-16 mb-8 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "rgba(245,237,216,0.05)", border: "1px solid rgba(245,237,216,0.1)", backdropFilter: "blur(12px)" }}>
        <div>
          <p className="font-semibold" style={{ color: "#F5EDD8" }}>Educational Institution?</p>
          <p style={{ color: "rgba(245,237,216,0.5)", fontSize: "0.875rem" }}>Integrate GandaBot into your curriculum — dashboards, analytics & bulk enrolment.</p>
        </div>
        <a href="#partnership" className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm"
          style={{ background: "rgba(33,144,121,0.2)", color: "#2EB898", border: "1px solid rgba(33,144,121,0.35)" }}>
          Apply for Partnership →
        </a>
      </div>
    </section>
  );
}

/* ─────────────────── Ticker ─────────────────── */
function Ticker() {
  return (
    <div className="gb-marquee-wrap overflow-hidden py-3 border-y" style={{ background: "#219079", borderColor: "#1a7261" }}>
      <div className="gb-marquee-inner flex gap-12 whitespace-nowrap">
        {[...TICKER, ...TICKER].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 text-sm font-medium" style={{ color: "#F5EDD8" }}>
            <span className="text-xs opacity-60">✦</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Stats ─────────────────── */
function Stats() {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24" style={{ background: "linear-gradient(135deg,#0C1F17,#0f2b1e)" }}>
      <div className="max-w-6xl mx-auto px-8 md:px-16">
        <p className="text-center mb-16 italic font-light" style={{ fontFamily: "Fraunces,Georgia,serif", color: "rgba(245,237,216,0.35)", letterSpacing: "0.06em" }}>
          — Trusted by learners worldwide —
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center" style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: `opacity .6s ease ${i*.12}s, transform .6s ease ${i*.12}s` }}>
              <div style={{ fontFamily: "Fraunces,Georgia,serif", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.n}</div>
              <div style={{ color: "rgba(245,237,216,0.45)", fontSize: "0.875rem", fontWeight: 300 }}>{s.label}</div>
              <div className="mx-auto mt-4 h-px" style={{ width: 40, background: `linear-gradient(90deg,transparent,${s.color},transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── Features ─────────────────── */
function Features() {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-28 gb-kente" style={{ background: "#F5EDD8" }}>
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="mb-20">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-6" style={{ background: "rgba(33,144,121,0.12)", color: "#219079" }}>
            Everything you need
          </span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="font-black leading-none" style={{ fontFamily: "Fraunces,Georgia,serif", fontSize: "clamp(2.5rem,5.5vw,5rem)", color: "#0C1F17", letterSpacing: "-0.025em", maxWidth: "14ch" }}>
              Your full African<br /><em style={{ fontStyle: "normal", color: "#219079" }}>learning suite.</em>
            </h2>
            <p className="max-w-xs leading-relaxed" style={{ color: "rgba(12,31,23,0.5)", fontWeight: 300 }}>
              Six powerful tools built for the way you actually learn — through conversation, culture, and community.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <a key={i} href="/app" className="gb-feature-card text-left rounded-3xl p-8 block group"
                style={{ background: "#fff", border: "1px solid rgba(12,31,23,0.07)", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(24px)", transition: `opacity .55s ease ${i*.07}s, transform .55s ease ${i*.07}s` }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${f.color}18` }}>
                  <Icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold mb-3 leading-tight" style={{ fontFamily: "Fraunces,Georgia,serif", fontSize: "1.25rem", color: "#0C1F17" }}>{f.title}</h3>
                <p className="leading-relaxed mb-6" style={{ color: "rgba(12,31,23,0.5)", fontSize: "0.9rem", fontWeight: 300 }}>{f.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: f.color }}>
                  Explore <ChevronRight size={14} />
                </span>
                <div className="mt-5 h-0.5 w-8 group-hover:w-full rounded-full transition-all duration-500" style={{ background: f.color }} />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── CTA ─────────────────── */
function CTA() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0C1F17,#153526)" }}>
      <div className="absolute gb-float pointer-events-none" style={{ top: "-80px", left: "-80px", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(33,144,121,0.18) 0%,transparent 70%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-60px", right: "-60px", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(244,123,32,0.12) 0%,transparent 70%)" }} />
      <div className="absolute inset-0 gb-kente opacity-40 pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center">
        <p className="italic font-light mb-6" style={{ fontFamily: "Fraunces,Georgia,serif", color: "rgba(245,237,216,0.4)", letterSpacing: "0.06em" }}>— Begin your journey —</p>
        <h2 className="font-black leading-none mb-8" style={{ fontFamily: "Fraunces,Georgia,serif", fontSize: "clamp(2.8rem,6.5vw,5.5rem)", color: "#F5EDD8", letterSpacing: "-0.025em" }}>
          Luganda is waiting<br /><span style={{ color: "#219079" }}>for you.</span>
        </h2>
        <p className="max-w-xl mx-auto mb-12 leading-relaxed" style={{ color: "rgba(245,237,216,0.5)", fontSize: "1.1rem", fontWeight: 300 }}>
          Join over 50,000 learners discovering the beauty of East African language and culture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignedIn>
            <a href="/app" className="gb-btn gb-btn-primary px-10 py-4 rounded-full font-semibold text-base" style={{ background: "#219079", color: "#fff" }}>
              Go to App
            </a>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="redirect" fallbackRedirectUrl="/app">
              <button className="gb-btn gb-btn-primary px-10 py-4 rounded-full font-semibold text-base" style={{ background: "#219079", color: "#fff" }}>
                Create Free Account
              </button>
            </SignUpButton>
            <SignInButton mode="redirect" fallbackRedirectUrl="/app">
              <button className="gb-btn px-10 py-4 rounded-full font-medium text-base border" style={{ borderColor: "rgba(245,237,216,0.2)", color: "rgba(245,237,216,0.6)" }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
        <p className="mt-6 text-xs" style={{ color: "rgba(245,237,216,0.25)" }}>No credit card required · Free forever for personal use</p>
      </div>
    </section>
  );
}

/* ─────────────────── Footer ─────────────────── */
function Footer() {
  const LINKS = {
    Product:   [{ l: "Features", h: "/#features" }, { l: "Blog", h: "/blog" }, { l: "FAQ", h: "/faq" }],
    Community: [{ l: "Forum", h: "/app" }, { l: "Podcast Hub", h: "/app" }, { l: "Partnerships", h: "/#partnership" }],
    Legal:     [{ l: "Privacy", h: "/faq" }, { l: "Terms", h: "/faq" }],
  };
  return (
    <footer className="pt-20 pb-10" style={{ background: "#0a1a12", borderTop: "1px solid rgba(33,144,121,0.15)" }}>
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-flex items-center gap-3 mb-5">
              <Image src="/gandabot-logo-ui.png" alt="" width={36} height={36} className="rounded-xl" />
              <span style={{ fontFamily: "Fraunces,Georgia,serif", fontWeight: 700, fontSize: "1.1rem", color: "#F5EDD8" }}>GandaBot</span>
            </a>
            <p style={{ color: "rgba(245,237,216,0.38)", fontSize: "0.875rem", lineHeight: 1.8, maxWidth: "22ch" }}>
              AI-powered Luganda learning for the next generation of African language lovers.
            </p>
          </div>
          {Object.entries(LINKS).map(([g, items]) => (
            <div key={g}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: "rgba(245,237,216,0.3)" }}>{g}</p>
              <ul className="space-y-3">
                {items.map(({ l, h }) => (
                  <li key={l}><a href={h} className="text-sm hover:text-white transition-colors" style={{ color: "rgba(245,237,216,0.5)" }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(245,237,216,0.07)" }}>
          <p style={{ color: "rgba(245,237,216,0.22)", fontSize: "0.8rem" }}>© {new Date().getFullYear()} GandaBot. Webale nyo for learning with us.</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(33,144,121,0.12)", color: "#2EB898" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2EB898", boxShadow: "0 0 4px #2EB898" }} />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────── Page export ─────────────────── */
export function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Ticker />
      <Stats />
      <Features />
      <CTA />
      <Footer />
    </>
  );
}
