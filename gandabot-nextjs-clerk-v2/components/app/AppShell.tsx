"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV = [
  { href: "/app/chat",      icon: "💬", label: "Chat" },
  { href: "/app/tutor",     icon: "🎙️", label: "Tutor" },
  { href: "/app/voice",     icon: "🗣️", label: "Voice" },
  { href: "/app/explorer",  icon: "🌍", label: "Explorer" },
  { href: "/app/podcasts",  icon: "🎧", label: "Podcasts" },
  { href: "/app/community", icon: "👥", label: "Community" },
  { href: "/app/create",    icon: "🎬", label: "GandaFeed" },
  { href: "/app/profile",   icon: "👤", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--forest)" }}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-white/10 shrink-0" style={{ background: "rgba(0,0,0,0.2)" }}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "var(--teal)", color: "var(--forest)" }}>G</div>
          <span className="font-bold tracking-tight" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>GandaBot</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: active ? "rgba(33,144,121,0.18)" : "transparent",
                  color: active ? "var(--teal-light)" : "var(--cream)",
                  opacity: active ? 1 : 0.7,
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs opacity-50" style={{ color: "var(--cream)" }}>Account</span>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 flex" style={{ background: "rgba(12,31,23,0.97)", backdropFilter: "blur(12px)" }}>
        {NAV.slice(0, 6).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 gap-0.5 text-xs"
              style={{ color: active ? "var(--teal-light)" : "var(--cream)", opacity: active ? 1 : 0.5 }}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
