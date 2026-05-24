"use client";

/**
 * LessonsView — Luganda A1 curriculum home screen.
 *
 * • Loads the user's completed lesson IDs from /api/lessons/progress
 * • Displays 30 lessons across 6 units in a scrollable list
 * • Sequential gating: lesson N+1 unlocks when N is complete
 * • Tapping an unlocked lesson opens a slide-up lesson panel
 * • Lesson panel: vocabulary → grammar → exercises (MCQ) → complete
 * • Completion: POST /api/lessons/progress, awards +50 XP, shows XP toast
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LESSONS,
  UNITS,
  getLessonsForUnit,
  isLessonUnlocked,
  curriculumProgress,
  type Lesson,
  type Exercise,
} from "@/lib/lessons";
import { useXPToast, XPToastContainer } from "@/components/app/XPToast";
import { Analytics } from "@/lib/analytics";

// XP per lesson is handled server-side by /api/lessons/progress.
// We only show the toast here — do NOT call awardXP() to avoid double-counting.
const XP_PER_LESSON = 50;

// ─── Types ────────────────────────────────────────────────────────────────────

interface LessonPanelProps {
  lesson:      Lesson;
  completed:   boolean;
  onComplete:  (lessonId: number) => void;
  onClose:     () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function UnitProgressBar({
  unit,
  completedIds,
}: {
  unit: number;
  completedIds: Set<number>;
}) {
  const unitLessons = getLessonsForUnit(unit);
  const done = unitLessons.filter((l) => completedIds.has(l.id)).length;
  return (
    <div className="flex gap-1 mt-2">
      {unitLessons.map((l) => (
        <div
          key={l.id}
          className="flex-1 h-1.5 rounded-full"
          style={{
            background: completedIds.has(l.id)
              ? "var(--teal)"
              : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
      <span
        className="text-[10px] ml-2 shrink-0 self-center opacity-50"
        style={{ color: "var(--cream)" }}
      >
        {done}/{unitLessons.length}
      </span>
    </div>
  );
}

// ─── Lesson Panel ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  index,
  onAnswer,
}: {
  exercise: Exercise;
  index: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const correct  = answered && selected === exercise.answer;

  function pick(option: string) {
    if (answered && correct) return;  // locked once correct; allow retry if wrong
    setSelected(option);
    onAnswer(option === exercise.answer);
  }

  function retry() {
    setSelected(null);
  }

  return (
    <div className="mb-4">
      <p
        className="text-sm font-semibold mb-3 leading-relaxed"
        style={{ color: "var(--cream)" }}
      >
        {index + 1}. {exercise.question}
      </p>
      <div className="flex flex-col gap-2">
        {exercise.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrect  = opt === exercise.answer;
          let bg        = "rgba(255,255,255,0.04)";
          let border    = "rgba(255,255,255,0.12)";
          let textColor = "var(--cream)";
          if (answered && correct) {
            // Locked-correct state: highlight the answer
            if (isCorrect) {
              bg = "rgba(33,144,121,0.18)"; border = "rgba(33,144,121,0.6)"; textColor = "var(--teal-light)";
            }
          } else if (answered && isSelected) {
            // Wrong selection
            bg = "rgba(244,123,32,0.1)"; border = "rgba(244,123,32,0.5)"; textColor = "var(--orange)";
          }
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={answered && correct}
              className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
              style={{ background: bg, borderColor: border, color: textColor }}
            >
              {answered && correct && isCorrect && (
                <span className="mr-2 font-bold" style={{ color: "var(--teal-light)" }}>✓</span>
              )}
              {answered && !correct && isSelected && (
                <span className="mr-2 font-bold" style={{ color: "var(--orange)" }}>✗</span>
              )}
              {opt}
            </button>
          );
        })}
      </div>
      {answered && correct && (
        <p className="text-xs mt-2 font-medium" style={{ color: "var(--teal-light)" }}>
          Correct! 🎉
        </p>
      )}
      {answered && !correct && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: "var(--orange)" }}>
            Not quite — try again!
          </p>
          <button
            onClick={retry}
            className="text-xs px-3 py-1 rounded-lg border transition-colors"
            style={{ borderColor: "rgba(244,123,32,0.4)", color: "var(--orange)" }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

function LessonPanel({ lesson, completed, onComplete, onClose }: LessonPanelProps) {
  // Track answers as Record<exerciseIndex, correct> so out-of-order answers work
  const [answers,   setAnswers]   = useState<Record<number, boolean>>({});
  const [finishing, setFinishing] = useState(false);
  const panelRef                  = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered   = answeredCount === lesson.exercises.length;
  const allCorrect    = Object.values(answers).every(Boolean);
  const canComplete   = allAnswered && allCorrect && !completed && !finishing;

  // Prevent body scroll when panel is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleAnswer(index: number, correct: boolean) {
    setAnswers((prev) => ({ ...prev, [index]: correct }));
  }

  function handleComplete() {
    if (!canComplete) return;
    setFinishing(true);
    onComplete(lesson.id);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        className="w-full rounded-t-3xl overflow-y-auto"
        style={{
          background:   "#0C1F17",
          border:       "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          maxHeight:    "92vh",
        }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 z-10 pt-3 pb-2 px-5" style={{ background: "#0C1F17" }}>
          <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mb-1.5"
                style={{ background: "rgba(33,144,121,0.15)", color: "var(--teal-light)" }}
              >
                Unit {lesson.unit} · {lesson.unitTitle}
              </div>
              <h2
                className="text-lg font-black leading-tight"
                style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
              >
                {lesson.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 mt-1"
              style={{ background: "rgba(255,255,255,0.08)", color: "var(--cream)" }}
              aria-label="Close lesson"
            >
              ✕
            </button>
          </div>
          {completed && (
            <div
              className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(33,144,121,0.12)", color: "var(--teal-light)" }}
            >
              <span>✓</span>
              <span>Lesson completed — review anytime</span>
            </div>
          )}
        </div>

        <div className="px-5 pb-10 pt-2">

          {/* ── Vocabulary ───────────────────────────────────────────────── */}
          <section className="mb-6">
            <h3
              className="text-xs font-bold tracking-widest mb-3 opacity-50"
              style={{ color: "var(--cream)" }}
            >
              VOCABULARY
            </h3>
            <div className="flex flex-col gap-2.5">
              {lesson.vocab.map((v, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl border border-white/8"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="font-bold text-base"
                      style={{ color: "var(--teal-light)", fontFamily: "Fraunces, serif" }}
                    >
                      {v.word}
                    </span>
                    <span className="text-sm opacity-70" style={{ color: "var(--cream)" }}>
                      — {v.meaning}
                    </span>
                  </div>
                  <p className="text-xs opacity-50 italic leading-relaxed" style={{ color: "var(--cream)" }}>
                    {v.example}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Grammar Note ─────────────────────────────────────────────── */}
          <section className="mb-6">
            <h3
              className="text-xs font-bold tracking-widest mb-3 opacity-50"
              style={{ color: "var(--cream)" }}
            >
              GRAMMAR NOTE
            </h3>
            <div
              className="p-4 rounded-2xl border"
              style={{
                background:   "rgba(244,123,32,0.06)",
                borderColor:  "rgba(244,123,32,0.2)",
              }}
            >
              <p className="font-bold text-sm mb-1.5" style={{ color: "var(--orange)" }}>
                {lesson.grammar.point}
              </p>
              <p className="text-sm opacity-80 mb-2 leading-relaxed" style={{ color: "var(--cream)" }}>
                {lesson.grammar.explanation}
              </p>
              <p
                className="text-xs font-medium px-3 py-2 rounded-xl italic"
                style={{
                  background: "rgba(244,123,32,0.08)",
                  color:      "var(--orange)",
                  borderLeft: "3px solid rgba(244,123,32,0.4)",
                }}
              >
                {lesson.grammar.example}
              </p>
            </div>
          </section>

          {/* ── Exercises ────────────────────────────────────────────────── */}
          <section className="mb-6">
            <h3
              className="text-xs font-bold tracking-widest mb-3 opacity-50"
              style={{ color: "var(--cream)" }}
            >
              EXERCISES
            </h3>
            {lesson.exercises.map((ex, i) => (
              <ExerciseCard
                key={i}
                exercise={ex}
                index={i}
                onAnswer={(correct) => handleAnswer(i, correct)}
              />
            ))}
            {allAnswered && !allCorrect && (
              <p className="text-xs text-center mt-1 mb-2 opacity-60" style={{ color: "var(--orange)" }}>
                Correct all answers using the Retry buttons above to complete this lesson.
              </p>
            )}
          </section>

          {/* ── Complete button ──────────────────────────────────────────── */}
          {!completed && (
            <button
              onClick={handleComplete}
              disabled={!canComplete || finishing}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all"
              style={{
                background: canComplete
                  ? "var(--teal)"
                  : "rgba(255,255,255,0.06)",
                color: canComplete
                  ? "var(--forest)"
                  : "rgba(255,255,255,0.25)",
                cursor: canComplete ? "pointer" : "not-allowed",
              }}
            >
              {finishing
                ? "Saving…"
                : canComplete
                ? "✓ Complete Lesson (+50 XP)"
                : allAnswered
                ? "Answer all questions correctly to complete"
                : "Answer all questions to complete"}
            </button>
          )}

          {completed && (
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl font-bold text-base"
              style={{ background: "rgba(33,144,121,0.15)", color: "var(--teal-light)" }}
            >
              ✓ Done — Back to Curriculum
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LessonsView ─────────────────────────────────────────────────────────────

export function LessonsView() {
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const { toasts, showXP } = useXPToast();

  // ── Load progress ─────────────────────────────────────────────────────────
  const loadProgress = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/lessons/progress")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { completed: number[] }) => {
        setCompletedIds(new Set(data.completed));
      })
      .catch(() => setError("Could not load your progress. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  // ── Complete a lesson ─────────────────────────────────────────────────────
  // Server handles XP addition; we just show the toast client-side.
  async function handleComplete(lessonId: number) {
    // Optimistically update UI immediately — feels snappy
    setCompletedIds((prev) => new Set([...prev, lessonId]));

    try {
      const res = await fetch("/api/lessons/progress", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ lesson_id: lessonId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { newly_completed: boolean; xp_awarded: number } = await res.json();
      // Show XP toast if newly completed (server confirms no double-claim)
      if (data.newly_completed) {
        const lesson = LESSONS.find((l) => l.id === lessonId);
        if (lesson) Analytics.lessonCompleted(lesson.id, lesson.title, lesson.unit);
        showXP(data.xp_awarded || XP_PER_LESSON);
      }
    } catch {
      // Network failure — UI already updated; show toast anyway
      showXP(XP_PER_LESSON);
    }

    // Close panel after a brief pause so the user can see the result
    setTimeout(() => setActiveLesson(null), 500);
  }

  const progress = curriculumProgress(completedIds);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
          style={{ background: "rgba(33,144,121,0.15)", color: "var(--teal-light)" }}
        >
          🇺🇬 Luganda · A1 Beginner
        </div>
        <h1
          className="text-2xl font-black mb-1"
          style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}
        >
          Learn Luganda
        </h1>
        <p className="text-sm opacity-50" style={{ color: "var(--cream)" }}>
          30 lessons across 6 units · complete in order
        </p>
      </div>

      {/* ── Overall progress bar ────────────────────────────────────────── */}
      <div
        className="mb-7 p-4 rounded-2xl border border-white/10"
        style={{ background: "rgba(33,144,121,0.08)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: "var(--cream)" }}>
            {completedIds.size} / {LESSONS.length} lessons
          </span>
          <span className="text-sm font-bold" style={{ color: "var(--teal-light)" }}>
            {progress}%
          </span>
        </div>
        <div
          className="w-full h-2.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: "var(--teal)" }}
          />
        </div>
        {progress === 100 && (
          <p className="text-xs mt-2 font-bold text-center" style={{ color: "var(--teal-light)" }}>
            🎓 A1 Complete! You earned {LESSONS.length * 50} XP
          </p>
        )}
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 mx-auto mb-3 animate-spin"
            style={{ borderColor: "var(--teal)", borderTopColor: "transparent" }}
          />
          <p className="text-sm opacity-40" style={{ color: "var(--cream)" }}>Loading progress…</p>
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="text-center py-12 px-6 rounded-2xl border border-orange-500/30"
          style={{ background: "rgba(244,123,32,0.06)" }}
        >
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm mb-4" style={{ color: "var(--orange)" }}>{error}</p>
          <button
            onClick={loadProgress}
            className="px-4 py-2 rounded-xl text-sm border border-orange-500/30 hover:border-orange-500 transition-colors"
            style={{ color: "var(--orange)" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Units & Lessons ─────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {UNITS.map(({ unit, title }) => {
            const unitLessons = getLessonsForUnit(unit);
            const done = unitLessons.filter((l) => completedIds.has(l.id)).length;
            const unitLocked = unit > 1 && !completedIds.has((unit - 1) * 5);

            return (
              <div key={unit}>
                {/* Unit header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2
                      className="font-black text-sm"
                      style={{
                        fontFamily: "Fraunces, serif",
                        color: unitLocked ? "rgba(255,255,255,0.25)" : "var(--cream)",
                      }}
                    >
                      Unit {unit}: {title}
                    </h2>
                    <UnitProgressBar unit={unit} completedIds={completedIds} />
                  </div>
                  {unitLocked && (
                    <span className="text-lg opacity-30">🔒</span>
                  )}
                  {done === unitLessons.length && (
                    <span className="text-lg">✅</span>
                  )}
                </div>

                {/* Lesson cards */}
                <div className="flex flex-col gap-2">
                  {unitLessons.map((lesson) => {
                    const isDone     = completedIds.has(lesson.id);
                    const unlocked   = isLessonUnlocked(lesson, completedIds);
                    const isNext     = !isDone && unlocked;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => unlocked && setActiveLesson(lesson)}
                        disabled={!unlocked}
                        className="w-full text-left px-4 py-3.5 rounded-2xl border flex items-center gap-3 transition-all"
                        style={{
                          background: isDone
                            ? "rgba(33,144,121,0.1)"
                            : isNext
                            ? "rgba(33,144,121,0.06)"
                            : "rgba(255,255,255,0.02)",
                          borderColor: isDone
                            ? "rgba(33,144,121,0.35)"
                            : isNext
                            ? "rgba(33,144,121,0.2)"
                            : "rgba(255,255,255,0.06)",
                          opacity:     unlocked ? 1 : 0.35,
                          cursor:      unlocked ? "pointer" : "not-allowed",
                        }}
                      >
                        {/* Status icon */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{
                            background: isDone
                              ? "var(--teal)"
                              : isNext
                              ? "rgba(33,144,121,0.2)"
                              : "rgba(255,255,255,0.06)",
                            color: isDone
                              ? "var(--forest)"
                              : isNext
                              ? "var(--teal-light)"
                              : "rgba(255,255,255,0.3)",
                          }}
                        >
                          {isDone ? "✓" : unlocked ? lesson.id : "🔒"}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm leading-tight"
                            style={{ color: isDone ? "var(--teal-light)" : "var(--cream)" }}
                          >
                            {lesson.title}
                          </p>
                          <p className="text-xs opacity-40 mt-0.5" style={{ color: "var(--cream)" }}>
                            5 words · grammar note · 2 exercises
                          </p>
                        </div>

                        {/* Right: XP or arrow */}
                        <div className="shrink-0">
                          {isDone ? (
                            <span className="text-xs font-bold" style={{ color: "var(--teal-light)" }}>
                              +50 XP
                            </span>
                          ) : isNext ? (
                            <span className="text-base opacity-60" style={{ color: "var(--cream)" }}>›</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lesson panel ────────────────────────────────────────────────── */}
      {activeLesson && (
        <LessonPanel
          lesson={activeLesson}
          completed={completedIds.has(activeLesson.id)}
          onComplete={handleComplete}
          onClose={() => setActiveLesson(null)}
        />
      )}

      <XPToastContainer toasts={toasts} />
    </div>
  );
}
