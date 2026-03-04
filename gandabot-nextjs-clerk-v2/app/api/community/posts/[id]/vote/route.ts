import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query, getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const postId = parseInt(id);
  const { voteType } = await req.json();
  if (!["up","down"].includes(voteType)) return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });

  const db = getDb();
  const existing = await db.query("SELECT vote_type FROM post_votes WHERE post_id=$1 AND user_id=$2", [postId, userId]);

  let newVoteType: string | null = voteType;
  if (existing.rowCount && existing.rows[0].vote_type === voteType) {
    await db.query("DELETE FROM post_votes WHERE post_id=$1 AND user_id=$2", [postId, userId]);
    newVoteType = null;
  } else {
    await db.query("INSERT INTO post_votes (post_id,user_id,vote_type) VALUES ($1,$2,$3) ON CONFLICT (post_id,user_id) DO UPDATE SET vote_type=EXCLUDED.vote_type", [postId, userId, voteType]);
  }

  const cnt = await db.query("SELECT COUNT(*)::int AS n FROM post_votes WHERE post_id=$1 AND vote_type='up'", [postId]);
  const likes = cnt.rows[0].n;
  await db.query("UPDATE community_posts SET likes=$1 WHERE id=$2", [likes, postId]);

  return NextResponse.json({ success: true, newVoteCount: likes, userVote: newVoteType });
}
