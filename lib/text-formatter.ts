/**
 * Text formatting utilities for improving story readability
 */

export interface FormattingOptions {
  maxParagraphLength?: number
  minParagraphLength?: number
  preserveExistingParagraphs?: boolean
  improveGrammar?: boolean
}

const defaultOptions: FormattingOptions = {
  maxParagraphLength: 500,
  minParagraphLength: 100,
  preserveExistingParagraphs: true,
  improveGrammar: true,
}

/**
 * Formats text into readable paragraphs with basic grammar improvements
 */
export function formatStoryText(text: string, options: FormattingOptions = {}): string {
  const opts = { ...defaultOptions, ...options }

  if (!text || text.trim().length === 0) {
    return text
  }

  let formattedText = text.trim()

  // Step 1: Basic grammar improvements
  if (opts.improveGrammar) {
    formattedText = improveBasicGrammar(formattedText)
  }

  // Step 2: Handle existing paragraphs
  if (opts.preserveExistingParagraphs && hasExistingParagraphs(formattedText)) {
    // Clean up existing paragraph breaks
    formattedText = cleanExistingParagraphs(formattedText)
  } else {
    // Create new paragraphs
    formattedText = createParagraphs(formattedText, opts)
  }

  return formattedText
}

/**
 * Checks if text already has paragraph breaks
 */
function hasExistingParagraphs(text: string): boolean {
  // Check for double line breaks or multiple sentences that suggest paragraph structure
  return /\n\s*\n/.test(text) || text.split(/[.!?]+/).length > 8
}

/**
 * Cleans up existing paragraph formatting
 */
function cleanExistingParagraphs(text: string): string {
  return (
    text
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      // Remove excessive line breaks (more than 2)
      .replace(/\n{3,}/g, "\n\n")
      // Clean up spacing around paragraphs
      .replace(/\n\s+\n/g, "\n\n")
      // Ensure paragraphs end with proper punctuation
      .replace(/([^.!?])\n\n/g, "$1.\n\n")
      .trim()
  )
}

/**
 * Creates paragraphs from unformatted text
 */
function createParagraphs(text: string, options: FormattingOptions): string {
  // Split by sentences first
  const sentences = text.split(/(?<=[.!?])\s+/)

  if (sentences.length <= 2) {
    return text // Too short to need paragraphs
  }

  const paragraphs: string[] = []
  let currentParagraph = ""
  let sentenceCount = 0

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim()
    if (!sentence) continue

    currentParagraph += (currentParagraph ? " " : "") + sentence
    sentenceCount++

    // Determine if we should start a new paragraph
    const shouldBreak = shouldStartNewParagraph(currentParagraph, sentence, sentenceCount, i, sentences, options)

    if (shouldBreak || i === sentences.length - 1) {
      paragraphs.push(currentParagraph.trim())
      currentParagraph = ""
      sentenceCount = 0
    }
  }

  return paragraphs.filter((p) => p.length > 0).join("\n\n")
}

/**
 * Determines if a new paragraph should be started
 */
function shouldStartNewParagraph(
  currentParagraph: string,
  currentSentence: string,
  sentenceCount: number,
  index: number,
  allSentences: string[],
  options: FormattingOptions,
): boolean {
  const { maxParagraphLength = 500, minParagraphLength = 100 } = options

  // Don't break if paragraph is too short
  if (currentParagraph.length < minParagraphLength && sentenceCount < 2) {
    return false
  }

  // Break if paragraph is getting too long
  if (currentParagraph.length > maxParagraphLength) {
    return true
  }

  // Break after 3-4 sentences (natural paragraph length)
  if (sentenceCount >= 3) {
    return true
  }

  // Break on topic transitions (look for transition words)
  const transitionWords = [
    "however",
    "meanwhile",
    "furthermore",
    "moreover",
    "nevertheless",
    "on the other hand",
    "in contrast",
    "similarly",
    "likewise",
    "after that",
    "then",
    "next",
    "finally",
    "in conclusion",
    "later",
    "eventually",
    "suddenly",
    "immediately",
  ]

  const nextSentence = allSentences[index + 1]
  if (nextSentence) {
    const nextLower = nextSentence.toLowerCase()
    if (transitionWords.some((word) => nextLower.startsWith(word))) {
      return true
    }
  }

  // Break on dialogue changes
  if (currentSentence.includes('"') && nextSentence && nextSentence.includes('"')) {
    return true
  }

  return false
}

/**
 * Applies basic grammar improvements
 */
function improveBasicGrammar(text: string): string {
  return (
    text
      // Fix spacing around punctuation
      .replace(/\s+([.!?])/g, "$1")
      .replace(/([.!?])([A-Z])/g, "$1 $2")

      // Fix common capitalization issues
      .replace(/\bi\b/g, "I")
      .replace(/^([a-z])/gm, (match) => match.toUpperCase())

      // Fix spacing issues
      .replace(/\s+/g, " ")
      .replace(/\s+([,;:])/g, "$1")
      .replace(/([,;:])\s*/g, "$1 ")

      // Ensure sentences end with punctuation
      .replace(/([^.!?])\s*$/g, "$1.")

      // Fix common contractions
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bwont\b/gi, "won't")
      .replace(/\bim\b/gi, "I'm")
      .replace(/\bits\s/gi, "it's ")
      .replace(/\byour\s+welcome\b/gi, "you're welcome")

      .trim()
  )
}

/**
 * Gets a preview of formatted text (first paragraph + indicator if more)
 */
export function getFormattedPreview(text: string, maxLength = 200): string {
  const formatted = formatStoryText(text)
  const firstParagraph = formatted.split("\n\n")[0]

  if (firstParagraph.length <= maxLength) {
    return firstParagraph + (formatted.includes("\n\n") ? "..." : "")
  }

  return firstParagraph.substring(0, maxLength).trim() + "..."
}

/**
 * Counts paragraphs in formatted text
 */
export function countParagraphs(text: string): number {
  const formatted = formatStoryText(text)
  return formatted.split("\n\n").filter((p) => p.trim().length > 0).length
}
