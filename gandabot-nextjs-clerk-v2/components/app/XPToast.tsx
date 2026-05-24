"use client";

/**
 * XPToast — a lightweight, self-dismissing notification that pops up
 * when the user earns XP. Appears bottom-center above the mobile nav.
 *
 * Usage:
 *   const { showXP } = useXPToast();
 *   showXP(25);   // shows "+25 XP" for 2.5 seconds
 */

import { useState, useCallback, useRef } from "react";

interface Toast {
  id: number;
  amount: number;
}

let _toastId = 0;

export function useXPToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const showXP = useCallback((amount: number) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, amount }]);

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, 2500);

    timersRef.current.set(id, timer);
  }, []);

  return { toasts, showXP };
}

export function XPToastContainer({ toasts }: { toasts: { id: number; amount: number }[] }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          style={{
            background: "rgba(46,184,152,0.95)",
            color: "#0C1F17",
            animation: "xp-rise 0.3s ease-out",
          }}
          role="status"
        >
          <span className="text-base">⭐</span>
          <span>+{toast.amount} XP</span>
        </div>
      ))}

      {/* Keyframe injected via style tag — avoids needing Tailwind config changes */}
      <style>{`
        @keyframes xp-rise {
          from { opacity: 0; transform: translateY(12px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0)    scale(1);   }
        }
      `}</style>
    </div>
  );
}
