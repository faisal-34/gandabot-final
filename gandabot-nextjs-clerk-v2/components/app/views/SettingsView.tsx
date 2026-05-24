"use client";

/**
 * SettingsView — app settings and account management.
 *
 * Apple App Store & Google Play require that apps with account creation
 * also offer in-app account deletion (App Store Review Guideline 5.1.1).
 * This view satisfies that requirement via the Clerk deleteUser() API.
 */

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/router";

// ─── Preference items ─────────────────────────────────────────────────────────

const DAILY_GOALS = [
  { id: "casual",         label: "Casual",         desc: "No pressure — explore at my own pace" },
  { id: "conversational", label: "Conversational",  desc: "Hold basic conversations in 30 days" },
  { id: "fluent",         label: "Fluency",         desc: "Full fluency — I'm fully committed" },
];

const GOAL_KEY       = "gandabot_daily_goal";
const NOTIF_KEY      = "gandabot_notifications";
const ONBOARDING_KEY = "gandabot_onboarding_done";

function readPref(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function savePref(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* quota */ }
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-widest opacity-40 mb-3 px-1" style={{ color: "var(--cream)" }}>
        {title}
      </p>
      <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  sublabel,
  right,
  danger,
  onClick,
}: {
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className="w-full flex items-center gap-3 px-5 py-4 border-b border-white/8 last:border-0 text-left transition-colors hover:bg-white/5 disabled:cursor-default disabled:hover:bg-transparent"
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: danger ? "#E74C3C" : "var(--cream)" }}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>
            {sublabel}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
      {onClick && !right && (
        <svg className="w-4 h-4 opacity-30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

// ─── SettingsView ─────────────────────────────────────────────────────────────

export function SettingsView() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [goal,           setGoalState]     = useState(() => readPref(GOAL_KEY, "conversational"));
  const [notifications,  setNotifications] = useState(() => readPref(NOTIF_KEY, "on") === "on");
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [deleteStep,     setDeleteStep]    = useState<"confirm" | "typing" | "deleting">("confirm");
  const [deleteInput,    setDeleteInput]   = useState("");
  const [deleteError,    setDeleteError]   = useState("");

  function setGoal(id: string) {
    setGoalState(id);
    savePref(GOAL_KEY, id);
  }

  function toggleNotifications() {
    const next = !notifications;
    setNotifications(next);
    savePref(NOTIF_KEY, next ? "on" : "off");
  }

  function resetOnboarding() {
    try { localStorage.removeItem(ONBOARDING_KEY); } catch { /* */ }
    router.reload();
  }

  // ── Account deletion ───────────────────────────────────────────────────────
  async function deleteAccount() {
    if (deleteInput !== "DELETE") {
      setDeleteError("Type DELETE in all caps to confirm.");
      return;
    }
    setDeleteStep("deleting");
    setDeleteError("");
    try {
      await user?.delete();
      await signOut();
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not delete account.";
      setDeleteError(msg);
      setDeleteStep("typing");
    }
  }

  const appVersion = "1.0.0"; // injected at build time in production

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
          Settings
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          Preferences and account management
        </p>
      </div>

      {/* Account info */}
      <Section title="ACCOUNT">
        <Row
          label={user?.fullName || user?.username || "Your account"}
          sublabel={user?.primaryEmailAddress?.emailAddress ?? ""}
        />
      </Section>

      {/* Learning preferences */}
      <Section title="LEARNING">
        <div className="px-5 py-4">
          <p className="text-sm font-medium mb-3" style={{ color: "var(--cream)" }}>Daily goal</p>
          <div className="flex flex-col gap-2">
            {DAILY_GOALS.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoal(g.id)}
                className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                style={{
                  borderColor: goal === g.id ? "var(--teal)" : "rgba(255,255,255,0.12)",
                  background:  goal === g.id ? "rgba(33,144,121,0.12)" : "transparent",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: goal === g.id ? "var(--teal-light)" : "var(--cream)" }}>
                    {g.label}
                  </p>
                  <p className="text-xs opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>{g.desc}</p>
                </div>
                {goal === g.id && (
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
            ))}
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="NOTIFICATIONS">
        <Row
          label="Learning reminders"
          sublabel="Daily nudge to keep your streak"
          right={
            <button
              onClick={toggleNotifications}
              className="relative w-11 h-6 rounded-full transition-colors shrink-0"
              style={{ background: notifications ? "var(--teal)" : "rgba(255,255,255,0.2)" }}
              role="switch"
              aria-checked={notifications}
              aria-label="Toggle learning reminders"
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: notifications ? "translateX(20px)" : "translateX(2px)" }}
              />
            </button>
          }
        />
      </Section>

      {/* App info */}
      <Section title="ABOUT">
        <Row label="Version" sublabel={`GandaBot ${appVersion}`} />
        <Row label="Privacy Policy" sublabel="gandabot.com/privacy" onClick={() => window.open("https://gandabot.com/privacy", "_blank")} />
        <Row label="Terms of Service" sublabel="gandabot.com/terms" onClick={() => window.open("https://gandabot.com/terms", "_blank")} />
        <Row label="Replay intro tour" sublabel="See onboarding again" onClick={resetOnboarding} />
      </Section>

      {/* Danger zone */}
      <Section title="ACCOUNT ACTIONS">
        <Row
          label="Sign out"
          onClick={async () => { await signOut(); router.replace("/"); }}
        />
        <Row
          label="Delete account"
          sublabel="Permanently remove your account and all data"
          danger
          onClick={() => { setShowDeleteFlow(true); setDeleteStep("confirm"); setDeleteInput(""); setDeleteError(""); }}
        />
      </Section>

      {/* ── Delete account dialog ────────────────────────────────────────── */}
      {showDeleteFlow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "#0C1F17", border: "1px solid rgba(255,255,255,0.12)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            {deleteStep === "confirm" && (
              <>
                <div className="text-3xl text-center mb-3">⚠️</div>
                <h2
                  id="delete-dialog-title"
                  className="font-black text-base text-center mb-2"
                  style={{ fontFamily: "Fraunces, serif", color: "#E74C3C" }}
                >
                  Delete your account?
                </h2>
                <p className="text-xs text-center opacity-60 mb-6 leading-relaxed" style={{ color: "var(--cream)" }}>
                  This will permanently delete your account, XP progress, conversation history, and all data. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteFlow(false)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--cream)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteStep("typing")}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "#E74C3C", color: "#fff" }}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

            {(deleteStep === "typing" || deleteStep === "deleting") && (
              <>
                <h2
                  id="delete-dialog-title"
                  className="font-black text-base text-center mb-2"
                  style={{ fontFamily: "Fraunces, serif", color: "#E74C3C" }}
                >
                  Confirm deletion
                </h2>
                <p className="text-xs text-center opacity-60 mb-4" style={{ color: "var(--cream)" }}>
                  Type <strong style={{ color: "#E74C3C" }}>DELETE</strong> to permanently delete your account.
                </p>
                <input
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="Type DELETE"
                  autoComplete="off"
                  disabled={deleteStep === "deleting"}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none text-center mb-2 font-mono tracking-widest disabled:opacity-50"
                  style={{ color: deleteInput === "DELETE" ? "#E74C3C" : "var(--cream)" }}
                />
                {deleteError && (
                  <p className="text-xs text-center mb-3" style={{ color: "#E74C3C" }}>{deleteError}</p>
                )}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowDeleteFlow(false)}
                    disabled={deleteStep === "deleting"}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium disabled:opacity-40"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--cream)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleteInput !== "DELETE" || deleteStep === "deleting"}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                    style={{ background: "#E74C3C", color: "#fff" }}
                  >
                    {deleteStep === "deleting" ? "Deleting…" : "Delete forever"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
