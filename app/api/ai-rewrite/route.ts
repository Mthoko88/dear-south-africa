import { generateText } from "ai"


export const maxDuration = 30

export async function POST(req: Request) {
  const { content, language } = await req.json()

  if (!content || content.trim().length === 0) {
    return Response.json({ error: "Content is required" }, { status: 400 })
  }

  const languageInstruction =
    language && language !== "english"
      ? `The story is written in ${language}. Keep the story in ${language} but correct the grammar and improve readability.`
      : "The story is written in English. Correct the grammar and improve readability while keeping it in English."

  const prompt = `You are a compassionate editor for Dear South Africa, a platform where ordinary South Africans share their personal stories.

${languageInstruction}

Your task is to EDIT and improve the following story while keeping it authentic and human. Fix errors and improve readability, but preserve the author's voice.

EDITING GUIDELINES:
1. Fix grammar, spelling, and punctuation errors
2. Improve sentence structure if needed for clarity
3. Add paragraph breaks where the topic changes or a natural pause occurs
4. If the writer lists multiple items, consider using bullet points (using • or -)
5. If there are numbered steps or sequences, format them as a numbered list
6. Add a subheading (on its own line, in bold or caps) if there's a clear section change
7. Keep contractions and casual language - this should sound like a real person talking
8. If English is poor, fix it to be correct but simple - don't make it fancy
9. Preserve ALL original information, stories, and details exactly
10. DO NOT add any new content, opinions, or embellishments
11. Keep the emotional tone exactly as the author intended
12. Return ONLY the edited story text, no explanations or meta-comments

FORMATTING:
- Use blank lines between paragraphs
- Use "• " for bullet points if listing items
- Use "1. " "2. " etc for numbered sequences
- Keep subheadings simple and short

Original story to edit:
${content}`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxTokens: 3000,
      temperature: 0.3, // Lower temperature for more consistent, focused rewrites
    })

    return Response.json({ rewrittenContent: text })
  } catch (error) {
    console.error("AI rewrite error:", error)
    return Response.json({ error: "Failed to rewrite content. Please try again." }, { status: 500 })
  }
}
