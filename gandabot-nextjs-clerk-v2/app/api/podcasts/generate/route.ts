import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, language = "luganda" } = await req.json();
  if (!topic) return NextResponse.json({ error: "Topic required" }, { status: 400 });

  let script = `Welcome to GandaBot Podcasts! Today we explore: ${topic}. This is an educational podcast about ${language} language and African culture.`;
  let title = `${topic} — A ${language} Learning Podcast`;
  let description = `AI-generated educational content about ${topic} for ${language} learners.`;

  if (process.env.OPENAI_API) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: `You are a podcast scriptwriter specializing in African language education. Create engaging ${language} learning content. Respond with JSON: {title, description, script} where script is 300-400 words.`
          }, {
            role: "user",
            content: `Create a ${language} learning podcast episode about: ${topic}`
          }],
          temperature: 0.8, max_tokens: 600, response_format: { type: "json_object" },
        }),
        signal: AbortSignal.timeout(25000),
      });
      const d = await res.json();
      const parsed = JSON.parse(d.choices[0]?.message?.content || "{}");
      title = parsed.title || title;
      description = parsed.description || description;
      script = parsed.script || script;
    } catch { /* use defaults */ }
  }

  // Generate audio via ElevenLabs if configured
  let audioUrl: string | null = null;
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const voiceRes = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", {
        method: "POST",
        headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text: script.slice(0, 4500), model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
        signal: AbortSignal.timeout(30000),
      });
      if (voiceRes.ok) {
        const buf = await voiceRes.arrayBuffer();
        audioUrl = `data:audio/mpeg;base64,${Buffer.from(buf).toString("base64")}`;
      }
    } catch { /* no audio */ }
  }

  await query(`CREATE TABLE IF NOT EXISTS podcasts (
    id SERIAL PRIMARY KEY, title TEXT, description TEXT, language TEXT DEFAULT 'luganda',
    category TEXT DEFAULT 'conversation', topic TEXT, script TEXT, audio_url TEXT, duration TEXT,
    listens INTEGER DEFAULT 0, is_ai_generated BOOLEAN DEFAULT TRUE, created_by TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
  )`);

  const rows = await query(
    "INSERT INTO podcasts (title,description,language,topic,script,audio_url,is_ai_generated,created_by) VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7) RETURNING *",
    [title, description, language, topic, script, audioUrl, userId]
  );

  return NextResponse.json({ success: true, podcast: rows[0] });
}
