/**
 * GandaBot Chat API
 * Primary: Sunbird Sunflower LLM
 * Fallback: OpenAI gpt-4o-mini
 * Fallback 2: Static responses
 * Auth: none required (unattended use allowed)
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sunbirdChat } from "@/lib/sunbird/client";

const SYSTEM_PROMPT = `You are GandaBot, a warm and knowledgeable AI assistant for learning Ugandan languages and culture. You are powered by Sunbird AI, built in Uganda for Africa.

You have deep expertise in:
- Luganda, Acholi, Ateso, Lugbara, Runyankole, Lusoga, Lumasaba, Kinyarwanda, Swahili
- Ugandan cultural practices, traditions, proverbs, and etiquette
- Historical, geographical, and social context about Uganda and East Africa
- Grammar, vocabulary, pronunciation tips across Ugandan languages

Guidelines:
- Always be encouraging and culturally respectful
- Include phrases in the relevant Ugandan language with translations
- Add pronunciation hints where helpful (e.g. syllable stress)
- Keep responses concise — under 200 words unless detail is needed
- Celebrate Uganda's linguistic diversity as a strength`;

const FALLBACK_RESPONSES = [
  "Webale nyo for your question! In Luganda, 'Oli otya?' means 'How are you?' — and the warm reply is 'Gyendi' (I am fine). What would you like to learn today?",
  "That's a fascinating question! Uganda has over 56 languages. Luganda is most widely spoken, but Acholi, Ateso, and Runyankole each have millions of speakers. Which language interests you?",
  "Nsanyuse nnyo — I am very happy to help you learn! Luganda has beautiful tonal qualities where pitch changes word meaning. Shall we practice some common phrases?",
  "Great question! 'Webale' means thank you in Luganda, 'Apwoyo' in Acholi, 'Webare' in Runyankole. Each language has its own unique rhythm. Which greeting would you like to learn?",
];

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { allowed, retryAfterMs } = rateLimit(`gandabot:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
    });
  }

  const { messages, language = "Luganda" } = await req.json();

  const systemPrompt = `${SYSTEM_PROMPT}\n\nThe user is currently learning: ${language}. Focus your responses and examples on ${language} language and related culture.`;

  // 1. Try Sunbird Sunflower LLM
  if (process.env.SUNBIRD_API_KEY) {
    try {
      const reply = await sunbirdChat(
        [{ role: "system", content: systemPrompt }, ...messages],
        { temperature: 0.7, max_tokens: 500 }
      );
      if (reply) return NextResponse.json({ reply });
    } catch (err) {
      console.error("[gandabot] Sunbird error:", err);
    }
  }

  // 2. Fallback: OpenAI
  if (process.env.OPENAI_API) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return NextResponse.json({ reply });
      }
    } catch (err) {
      console.error("[gandabot] OpenAI fallback error:", err);
    }
  }

  // 3. Static fallback
  const reply = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  return NextResponse.json({ reply });
}
