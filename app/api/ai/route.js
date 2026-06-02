import { NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request) {
  const body = await request.json()
  const { message } = body || {}

  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI API key not configured." }, { status: 500 })
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are a helpful AI assistant for an internship portal." },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 512,
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.ok ? 200 : res.status })
  } catch (error) {
    console.error("AI proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch AI response." }, { status: 500 })
  }
}
