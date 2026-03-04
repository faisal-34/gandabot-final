import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await req.json();

  if (!process.env.OPENAI_API) {
    const fallbacks = [
      "Webale nyo for your question! In Luganda, we say 'Oli otya?' to greet someone. How are you finding the language so far?",
      "That's a great question about Luganda! The language is a Bantu language spoken by the Baganda people of Uganda. What would you like to learn more about?",
      "Nsanyuse nnyo — I am very happy to help you learn! Luganda has beautiful tonal qualities. Would you like to practice some common phrases?",
    ];
    return NextResponse.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are GandaBot, an expert AI assistant for learning Luganda language and understanding Ugandan culture. 
You help learners with:
- Luganda vocabulary, grammar, and pronunciation
- Ugandan cultural practices and traditions  
- Translations between English and Luganda
- Historical and geographical information about Uganda and East Africa

Always be encouraging, culturally sensitive, and include Luganda phrases with translations when relevant. Keep responses concise but informative.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ reply: data.choices[0]?.message?.content });
  } catch (err) {
    console.error("GandaBot API error:", err);
    return NextResponse.json({ reply: "Nkwetaaga okugenda — I need to go briefly. Please try again in a moment!" });
  }
}
