import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query, getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clipId = parseInt(params.id);
  if (isNaN(clipId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const client = await getDb();
  try {
    await client.query("BEGIN");

    // Check existing like
    const existing = await client.query(
      "SELECT 1 FROM clip_likes WHERE clip_id=$1 AND user_id=$2",
      [clipId, userId]
    );

    let liked: boolean;
    if (existing.rows.length > 0) {
      // Unlike
      await client.query("DELETE FROM clip_likes WHERE clip_id=$1 AND user_id=$2", [clipId, userId]);
      await client.query("UPDATE ganda_clips SET likes = GREATEST(likes - 1, 0) WHERE id=$1", [clipId]);
      liked = false;
    } else {
      // Like
      await client.query("INSERT INTO clip_likes (clip_id, user_id) VALUES ($1,$2)", [clipId, userId]);
      await client.query("UPDATE ganda_clips SET likes = likes + 1 WHERE id=$1", [clipId]);
      liked = true;
    }

    await client.query("COMMIT");

    const result = await client.query("SELECT likes FROM ganda_clips WHERE id=$1", [clipId]);
    return NextResponse.json({ liked, likes: result.rows[0]?.likes ?? 0 });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  } finally {
    client.release();
  }
}
