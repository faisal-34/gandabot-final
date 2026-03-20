import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { voteType } = await req.json();
  if (!["up", "down"].includes(voteType)) return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });

  // Use a dedicated connection so we can run in a transaction and release cleanly
  const client = await getDb();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT vote_type FROM post_votes WHERE post_id=$1 AND user_id=$2",
      [postId, userId]
    );

    let newVoteType: string | null = voteType;

    if (existing.rows.length > 0 && existing.rows[0].vote_type === voteType) {
      // Same vote again → toggle off (remove)
      await client.query(
        "DELETE FROM post_votes WHERE post_id=$1 AND user_id=$2",
        [postId, userId]
      );
      newVoteType = null;
    } else {
      // New vote or changing vote direction
      await client.query(
        `INSERT INTO post_votes (post_id, user_id, vote_type) VALUES ($1,$2,$3)
         ON CONFLICT (post_id, user_id) DO UPDATE SET vote_type = EXCLUDED.vote_type`,
        [postId, userId, voteType]
      );
    }

    // Recount upvotes and sync to posts table
    const cnt = await client.query(
      "SELECT COUNT(*)::int AS n FROM post_votes WHERE post_id=$1 AND vote_type='up'",
      [postId]
    );
    const likes: number = cnt.rows[0]?.n ?? 0;
    await client.query("UPDATE community_posts SET likes=$1 WHERE id=$2", [likes, postId]);

    await client.query("COMMIT");

    return NextResponse.json({ success: true, newVoteCount: likes, userVote: newVoteType });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Vote route error:", err);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  } finally {
    client.release();
  }
}
