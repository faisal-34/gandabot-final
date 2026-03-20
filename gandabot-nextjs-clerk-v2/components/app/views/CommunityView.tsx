"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

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

const CATEGORIES = ["all", "general", "pronunciation", "grammar", "culture"];
const CAT_COLORS: Record<string, string> = {
  general: "#219079",
  pronunciation: "#F47B20",
  grammar: "#2EB898",
  culture: "#9B59B6",
};

export function CommunityView() {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general" });
  const [submitting, setSubmitting] = useState(false);
  const [aiReplies, setAiReplies] = useState<Record<number, string>>({});
  const [loadingReply, setLoadingReply] = useState<number | null>(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/community/posts?${params}`);
      setPosts(await res.json());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  // Re-fetch when category changes; search re-fetches via form submit
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadPosts(); }, [category]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPosts();
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, authorName: user?.fullName || user?.username || "Anonymous" }),
      });
      setForm({ title: "", content: "", category: "general" });
      setShowForm(false);
      loadPosts();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  }

  async function vote(postId: number, type: "up" | "down") {
    await fetch(`/api/community/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voteType: type }),
    });
    loadPosts();
  }

  async function getAiReply(post: Post) {
    setLoadingReply(post.id);
    try {
      const res = await fetch(`/api/community/posts/${post.id}/ai-reply`, { method: "POST" });
      const data = await res.json();
      setAiReplies((p) => ({ ...p, [post.id]: data.reply }));
    } catch { /* silent */ }
    finally { setLoadingReply(null); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ fontFamily: "Fraunces, serif", color: "var(--cream)" }}>Community</h1>
          <p className="text-sm opacity-50 mt-0.5" style={{ color: "var(--cream)" }}>Learn together, grow together</p>
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
        <form onSubmit={submitPost} className="mb-6 p-5 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
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
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="gb-btn gb-btn-primary px-4 py-2 rounded-lg text-sm font-semibold ml-auto"
              style={{ background: "var(--teal)", color: "var(--forest)" }}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-white/20" style={{ color: "var(--cream)" }}>
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
          <button type="submit" className="px-3 py-2 rounded-lg border border-white/20 text-sm" style={{ color: "var(--cream)" }}>🔍</button>
        </form>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={{
                borderColor: category === c ? "var(--teal)" : "rgba(255,255,255,0.2)",
                background: category === c ? "rgba(33,144,121,0.15)" : "transparent",
                color: category === c ? "var(--teal-light)" : "var(--cream)",
              }}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 opacity-40" style={{ color: "var(--cream)" }}>No posts yet. Be the first!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="p-5 rounded-2xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-semibold text-base leading-snug" style={{ color: "var(--cream)" }}>{post.title}</h2>
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ background: `${CAT_COLORS[post.category] || "#219079"}22`, color: CAT_COLORS[post.category] || "var(--teal-light)" }}
                >
                  {post.category}
                </span>
              </div>
              <p className="text-sm opacity-70 leading-relaxed mb-3" style={{ color: "var(--cream)" }}>{post.content}</p>

              {post.ai_insights && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs italic" style={{ background: "rgba(33,144,121,0.1)", color: "var(--teal-light)", borderLeft: "3px solid var(--teal)" }}>
                  ✦ AI Insight: {post.ai_insights}
                </div>
              )}

              {aiReplies[post.id] && (
                <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(244,123,32,0.08)", color: "#F5EDD8", borderLeft: "3px solid var(--orange)" }}>
                  🤖 {aiReplies[post.id]}
                </div>
              )}

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs opacity-40" style={{ color: "var(--cream)" }}>
                  {post.author_name} · {new Date(post.created_at).toLocaleDateString()}
                </span>
                <div className="ml-auto flex items-center gap-3">
                  <button onClick={() => vote(post.id, "up")} className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity" style={{ color: "var(--cream)" }}>
                    ▲ {post.likes}
                  </button>
                  <button
                    onClick={() => getAiReply(post)}
                    disabled={loadingReply === post.id}
                    className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--teal-light)" }}
                  >
                    {loadingReply === post.id ? "…" : "🤖 AI Reply"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
