"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED = [
  "How do I say 'good morning' in Luganda?",
  "Teach me numbers 1-10",
  "What is the Baganda culture?",
  "How do tones work in Luganda?",
];

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Nkusubiriza — Welcome! I'm GandaBot, your AI guide to Luganda and Ugandan culture. Ask me anything — vocabulary, grammar, pronunciation, or culture. Tugende! 🇺🇬" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text || input).trim();
    if (!content) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/gandabot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply || "Bambi — something went wrong. Please try again." }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Nkwetaaga okugenda briefly — please try again!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: "100vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "var(--teal)", color: "var(--forest)" }}>G</div>
        <div>
          <div className="font-semibold text-sm" style={{ color: "var(--cream)" }}>GandaBot</div>
          <div className="text-xs opacity-50" style={{ color: "var(--cream)" }}>AI Luganda Tutor</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs opacity-50" style={{ color: "var(--cream)" }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "var(--teal)", color: "var(--forest)", borderBottomRightRadius: "4px" }
                  : { background: "rgba(255,255,255,0.07)", color: "var(--cream)", borderBottomLeftRadius: "4px" }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm opacity-60" style={{ background: "rgba(255,255,255,0.07)", color: "var(--cream)" }}>
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: "0ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "150ms" }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: "300ms" }}>•</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown when only 1 message) */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2 shrink-0">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="px-3 py-1.5 rounded-full text-xs border border-white/20 hover:border-teal-500 transition-colors"
              style={{ color: "var(--cream)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/10">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-3 items-end"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask about Luganda…"
            className="flex-1 resize-none px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-sm outline-none focus:border-teal-500"
            style={{ color: "var(--cream)", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="gb-btn gb-btn-primary px-4 py-3 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-40"
            style={{ background: "var(--teal)", color: "var(--forest)" }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
