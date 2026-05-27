import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    console.log("[v0] AI title suggestion requested, content length:", content?.length)

    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a helpful assistant for Dear South Africa, a storytelling platform. Generate a compelling, concise title (maximum 8 words) for the user's story. The title should capture the essence of their story while being engaging and emotionally resonant. Return ONLY the title, nothing else.

Story content:
${content.substring(0, 1500)}`,
      maxTokens: 50,
      temperature: 0.7,
    })

    console.log("[v0] AI generated title:", result.text)

    return new Response(JSON.stringify({ title: result.text.trim() }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[v0] Error suggesting title:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: "Failed to suggest title", details: errorMessage }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
