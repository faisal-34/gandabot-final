"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { awardXP } from "@/lib/xp";
import { useXPToast, XPToastContainer } from "@/components/app/XPToast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  author_name: string;
  likes: number;
  reply_count: number;
  ai_insights: string | null;
  created_at: string;
}

interface Reply {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  created_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["all", "general", "pronunciation", "grammar", "culture"];
const CAT_COLORS: Record<string, string> = {
  general:       "#219079",
  pronunciation: "#F47B20",
  grammar:       "#2EB898",
  culture:       "#9B59B6",
};

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Reply thread sub-component ───────────────────────────────────────────────

function ReplyThread({
  postId,
  authorName,
  onReplyPosted,
}: {
  postId: number;
  authorName: string;
  onReplyPosted: () => void;
}) {
  const [replies,     setReplies]     = useState<Reply[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [replyText,   setReplyText]   = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [loaded,      setLoaded]      = useState(false);

  // Load replies on first open
  useEffect(() => {
    if (loaded) return;
    setLoading(true);
    fetch(`/api/community/posts/${postId}/replies`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: Reply[]) => {
        setReplies(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setError("Could not load replies."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function postReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText.trim(), authorName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reply: Reply = await res.json();
      setReplies((prev) => [...prev, reply]);
      setReplyText("");
      onReplyPosted(); // bumps the reply_count in the parent
    } catch {
      setError("Could not post your reply — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      {/* Reply list */}
      {loading && (
        <p className="text-xs opacity-40 py-2 text-center" style={{ color: "var(--cream)" }}>
          Loading replies…
        </p>
      )}

      {replies.length > 0 && (
        <div className="flex flex-col gap-2.5 mb-3">
          {replies.map((r) => (
            <div
              key={r.id}
              className="flex gap-2.5"
            >
              {/* Thread line */}
              <div className="flex flex-col items-center">
                <div className="w-px flex-1 mt-1" style={{ background: "rgba(255,255,255,0.1)" }} />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: "var(--teal-light)" }}>
                    {r.author_name}
                  </span>
                  <span className="text-[10px] opacity-30" style={{ color: "var(--cream)" }}>
                    {relativeTime(r.created_at)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-80" style={{ color: "var(--cream)" }}>
                  {r.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && replies.length === 0 && loaded && (
        <p className="text-xs opacity-30 mb-3 text-center" style={{ color: "var(--cream)" }}>
          No replies yet — be the first!
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs mb-2 px-1" style={{ color: "var(--orange)" }}>⚠ {error}</p>
      )}

      {/* Reply form */}
      <form onSubmit={postReply} className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              postReply(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Write a reply…"
          maxLength={1000}
          className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/5 text-xs outline-none resize-none"
          style={{ color: "var(--cream)" }}
        />
        <button
          type="submit"
          disabled={submitting || !replyText.trim()}
          className="px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-opacity disabled:opacity-40"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          {submitting ? "…" : "Reply"}
        </button>
      </form>
    </div>
  );
}

// ─── CommunityView ────────────────────────────────────────────────────────────

export function CommunityView() {
  const { user } = useUser();
  const [posts,        setPosts]        = useState<Post[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [category,     setCategory]     = useState("all");
  const [search,       setSearch]       = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState({ title: "", content: "", category: "general" });
  const [submitting,   setSubmitting]   = useState(false);
  const [aiReplies,    setAiReplies]    = useState<Record<number, string>>({});
  const [loadingReply, setLoadingReply] = useState<number | null>(null);
  const [loadError,    setLoadError]    = useState("");
  const [openThreads,  setOpenThreads]  = useState<Set<number>>(new Set());
  const { toasts, showXP } = useXPToast();

  const authorName = user?.fullName || user?.username || "Anonymous";

  // ── Load posts ─────────────────────────────────────────────────────────────
  async function loadPosts() {
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/community/posts?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setLoadError("Could not load posts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // ── Search ─────────────────────────────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPosts();
  }

  // ── Submit post ────────────────────────────────────────────────────────────
  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, authorName }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForm({ title: "", content: "", category: "general" });
      setShowForm(false);
      loadPosts();
      showXP(await awardXP("community_post"));
    } catch {
      setLoadError("Could not submit post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Vote ───────────────────────────────────────────────────────────────────
  async function vote(postId: number, type: "up" | "down") {
    const delta = type === "up" ? 1 : -1;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + delta } : p)),
    );
    try {
      const res = await fetch(`/api/community/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });
      if (!res.ok) throw new Error("Vote failed");
      const data = await res.json();
      if (typeof data.likes === "number") {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, likes: data.likes } : p)),
        );
      }
    } catch {
      // Roll back optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes: p.likes - delta } : p)),
      );
    }
  }

  // ── AI reply ───────────────────────────────────────────────────────────────
  async function getAiReply(post: Post) {
    setLoadingReply(post.id);
    try {
      const res = await fetch(`/api/community/posts/${post.id}/ai-reply`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAiReplies((p) => ({ ...p, [post.id]: data.reply ?? "No reply available." }));
    } catch {
      setAiReplies((p) => ({ ...p, [post.id]: "Could not get an AI reply right now." }));
    } finally {
      setLoadingReply(null);
    }
  }

  // ── Toggle reply thread ────────────────────────────────────────────────────
  function toggleThread(postId: number) {
    setOpenThreads((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); } else { next.add(postId); }
      return next;
    });
  }

  // Callback from ReplyThread: bump the local reply_count so the count stays fresh
  function handleReplyPosted(postId: number) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reply_count: p.reply_count + 1 } : p)),
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <XPToastContainer toasts={toasts} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>
            Community
          </h1>
          <p className="text-sm opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>
            Learn together, grow together
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="gb-btn gb-btn-primary px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--teal)", color: "var(--forest)" }}
        >
          + New Post
        </button>
      </div>

      {/* New post form */}
      {showForm && (
        <form
          onSubmit={submitPost}
          className="mb-6 p-5 rounded-2xl border border-white/10"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <h2 className="font-semibold mb-4 text-sm" style={{ color: "var(--cream)" }}>Create a post</h2>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Post title…"
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm mb-3 outline-none"
            style={{ color: "var(--cream)" }}
          />
          <textarea
            required
            rows={3}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Share your question, tip, or experience…"
            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm mb-3 outline-none resize-none"
            style={{ color: "var(--cream)" }}
          />
          <div className="flex gap-3 items-center">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm outline-none"
              style={{ color: "var(--cream)", background: "#0C1F17" }}
            >
              {CATEGORIES.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="gb-btn gb-btn-primary px-4 py-2 rounded-lg text-sm font-semibold ml-auto disabled:opacity-40"
              style={{ background: "var(--teal)", color: "var(--forest)" }}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm border border-white/20"
              style={{ color: "var(--cream)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="flex-1 px-3 py-2 rounded-lg border border-white/20 bg-white/5 text-sm outline-none"
            style={{ color: "var(--cream)" }}
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-lg border border-white/20 text-sm"
            style={{ color: "var(--cream)" }}
            aria-label="Search"
          >
            🔍
          </button>
        </form>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: category === c ? "var(--teal)" : "rgba(255,255,255,0.2)",
                background:  category === c ? "rgba(33,144,121,0.15)" : "transparent",
                color:       category === c ? "var(--teal-light)" : "var(--cream)",
              }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div
          className="mb-4 px-4 py-3 rounded-xl border border-orange-500/30 flex items-start gap-3"
          style={{ background: "rgba(244,123,32,0.08)" }}
        >
          <span style={{ color: "var(--orange)" }}>⚠</span>
          <p className="text-sm flex-1" style={{ color: "var(--orange)" }}>{loadError}</p>
          <button
            onClick={() => setLoadError("")}
            className="text-xs opacity-60 hover:opacity-100"
            style={{ color: "var(--orange)" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>No posts yet. Be the first!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const threadOpen = openThreads.has(post.id);
            return (
              <div
                key={post.id}
                className="p-5 rounded-2xl border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                {/* Post header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="font-semibold text-base leading-snug" style={{ color: "var(--cream)" }}>
                    {post.title}
                  </h2>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${CAT_COLORS[post.category] || "#219079"}22`,
                      color: CAT_COLORS[post.category] || "var(--teal-light)",
                    }}
                  >
                    {post.category}
                  </span>
                </div>

                <p className="text-sm opacity-70 leading-relaxed mb-3" style={{ color: "var(--cream)" }}>
                  {post.content}
                </p>

                {/* AI insight */}
                {post.ai_insights && (
                  <div
                    className="mb-3 px-3 py-2 rounded-lg text-xs italic"
                    style={{ background: "rgba(33,144,121,0.1)", color: "var(--teal-light)", borderLeft: "3px solid var(--teal)" }}
                  >
                    ✦ AI Insight: {post.ai_insights}
                  </div>
                )}

                {/* AI reply (on-demand) */}
                {aiReplies[post.id] && (
                  <div
                    className="mb-3 px-3 py-2 rounded-lg text-xs"
                    style={{ background: "rgba(244,123,32,0.08)", color: "#F5EDD8", borderLeft: "3px solid var(--orange)" }}
                  >
                    🤖 {aiReplies[post.id]}
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs opacity-40" style={{ color: "var(--cream)" }}>
                    {post.author_name} · {relativeTime(post.created_at)}
                  </span>

                  <div className="ml-auto flex items-center gap-3">
                    {/* Upvote */}
                    <button
                      onClick={() => vote(post.id, "up")}
                      className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: "var(--cream)" }}
                      aria-label="Upvote"
                    >
                      ▲ {post.likes}
                    </button>

                    {/* AI Reply */}
                    <button
                      onClick={() => getAiReply(post)}
                      disabled={loadingReply === post.id}
                      className="text-xs opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                      style={{ color: "var(--teal-light)" }}
                    >
                      {loadingReply === post.id ? "…" : "🤖 AI Reply"}
                    </button>

                    {/* Toggle reply thread */}
                    <button
                      onClick={() => toggleThread(post.id)}
                      className="flex items-center gap-1.5 text-xs transition-opacity"
                      style={{
                        color:   threadOpen ? "var(--teal-light)" : "var(--cream)",
                        opacity: threadOpen ? 1 : 0.5,
                      }}
                      aria-expanded={threadOpen}
                      aria-label={`${threadOpen ? "Hide" : "Show"} replies`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.reply_count > 0
                        ? `${post.reply_count} ${post.reply_count === 1 ? "reply" : "replies"}`
                        : "Reply"}
                    </button>
                  </div>
                </div>

                {/* Inline reply thread */}
                {threadOpen && (
                  <ReplyThread
                    postId={post.id}
                    authorName={authorName}
                    onReplyPosted={() => handleReplyPosted(post.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
