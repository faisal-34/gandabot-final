import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isValidEmail } from "@/lib/utils";

async function ensureTable() {
  await query(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(), active BOOLEAN DEFAULT TRUE
  )`);
}

export async function POST(req: NextRequest) {
  await ensureTable();
  const { email } = await req.json();
  if (!email || !isValidEmail(email)) return NextResponse.json({ error: "Valid email required" }, { status: 400 });

  const normalized = email.toLowerCase();
  const existing = await query<{ id: number; active: boolean }>("SELECT id, active FROM newsletter_subscribers WHERE email=$1", [normalized]);

  if (existing.length) {
    if (existing[0].active) return NextResponse.json({ success: true, message: "You're already subscribed!" });
    await query("UPDATE newsletter_subscribers SET active=TRUE, subscribed_at=NOW() WHERE email=$1", [normalized]);
    return NextResponse.json({ success: true, message: "Welcome back! Subscription reactivated." });
  }

  await query("INSERT INTO newsletter_subscribers (email) VALUES ($1)", [normalized]);

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `GandaBot <noreply@${process.env.EMAIL_DOMAIN || "gandabot.com"}>`,
          to: email,
          subject: "Mwandiikibirwa! Welcome to GandaBot",
          html: "<h2>Mwandiikibirwa! (Welcome!)</h2><p>Thank you for subscribing to GandaBot. You'll receive updates on new features, language tips, and cultural insights.</p><p>Webale nyo,<br>The GandaBot Team</p>",
        }),
        signal: AbortSignal.timeout(8000),
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json({ success: true, message: "Webale nyo! You've subscribed to GandaBot updates." });
}
