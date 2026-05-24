/**
 * GET /api/pronunciation-tutor/words?language=lug
 *
 * Returns a list of practice words for the given language.
 * Fetches from the `pronunciation_words` table if it exists;
 * returns 404 with an empty body if the table is missing so the
 * client gracefully falls back to its built-in static word bank.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/lib/db";

interface WordEntry {
  word: string;
  meaning: string;
}

const SUPPORTED = new Set(["lug", "ach", "teo", "nyn", "lgg", "swh"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const lang = (req.query.language as string)?.toLowerCase();
  if (!lang || !SUPPORTED.has(lang)) {
    return res.status(400).json({ error: "language must be one of: lug, ach, teo, nyn, lgg, swh" });
  }

  try {
    const rows = await query<WordEntry>(
      `SELECT word, meaning
       FROM pronunciation_words
       WHERE language_code = $1
       ORDER BY display_order ASC, id ASC
       LIMIT 30`,
      [lang],
    );

    // Return words if found; otherwise return 204 so the client
    // knows to keep its static fallback without a noisy error.
    if (rows.length === 0) {
      return res.status(204).end();
    }

    return res.status(200).json(rows);
  } catch (err: unknown) {
    // Table likely doesn't exist yet — client uses static fallback
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("does not exist")) {
      return res.status(204).end();
    }
    console.error("[pronunciation-tutor/words]", msg);
    return res.status(500).json({ error: "Failed to load words" });
  }
}
