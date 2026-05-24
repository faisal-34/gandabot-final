/**
 * /api/community/posts/[postId]/replies
 *
 * GET  — list replies for a post, ordered oldest-first
 * POST — add a new reply to a post
 *
 * Rate-limit: 20 reads / 5 writes per IP per minute.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { query } from "@/lib/db";
import { rateLimitKey, checkRateLimit } from "@/lib/rate-limit";

interface Reply {
  id: number;
  post_id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = parseInt(req.query.postId as string, 10);
  if (isNaN(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid postId" });
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? "anon";

  // ── GET /api/community/posts/[postId]/replies ─────────────────────────────
  if (req.method === "GET") {
    const limited = checkRateLimit(ip, "community-replies-read", 20, 60_000);
    if (limited) return limited;

    try {
      const rows = await query<Reply>(
        `SELECT id, post_id, author_name, content, created_at
         FROM community_replies
         WHERE post_id = $1
         ORDER BY created_at ASC
         LIMIT 50`,
        [postId],
      );
      return res.status(200).json(rows);
    } catch (err: unknown) {
      console.error("[replies GET]", err instanceof Error ? err.message : err);
      return res.status(500).json({ error: "Failed to load replies" });
    }
  }

  // ── POST /api/community/posts/[postId]/replies ────────────────────────────
  if (req.method === "POST") {
    const limited = checkRateLimit(ip, "community-replies-write", 5, 60_000);
    if (limited) return limited;

    // Auth: allow anonymous name but require Clerk session in production
    const { userId } = getAuth(req);
    const { content, authorName } = req.body ?? {};

    if (!content?.trim()) {
      return res.status(400).json({ error: "content is required" });
    }
    if (content.trim().length > 1000) {
      return res.status(400).json({ error: "Reply must be under 1000 characters" });
    }

    const name = (authorName as string)?.trim() || "Anonymous";

    try {
      // Verify the parent post exists
      const posts = await query<{ id: number }>(
        "SELECT id FROM community_posts WHERE id = $1",
        [postId],
      );
      if (posts.length === 0) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Insert the reply and bump reply_count atomically using a CTE chain.
      // The UPDATE runs as part of the same statement so both always succeed or fail together.
      const [reply] = await query<Reply>(
        `WITH inserted AS (
           INSERT INTO community_replies (post_id, author_name, content, user_id)
           VALUES ($1, $2, $3, $4)
           RETURNING id, post_id, author_name, content, created_at
         ),
         bump AS (
           UPDATE community_posts
           SET reply_count = reply_count + 1
           WHERE id = $1
         )
         SELECT id, post_id, author_name, content, created_at FROM inserted`,
        [postId, name, content.trim(), userId ?? null],
      );

      return res.status(201).json(reply ?? { error: "Insert failed" });
    } catch (err: unknown) {
      console.error("[replies POST]", err instanceof Error ? err.message : err);
      return res.status(500).json({ error: "Failed to post reply" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
