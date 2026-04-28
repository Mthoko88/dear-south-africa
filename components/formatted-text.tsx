"use client"

import type React from "react"

interface FormattedTextProps {
  content: string
  className?: string
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
  const containsHTML = /<[^>]+>/.test(content)

  if (containsHTML) {
    // Render HTML content with dangerouslySetInnerHTML
    return (
      <div
        className={`prose prose-gray dark:prose-invert max-w-none story-content text-foreground ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          // Inline styles to ensure paragraph spacing is applied
          lineHeight: "1.75",
        }}
      />
    )
  }

  // Split content by double line breaks to create paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim())

  // Helper to group consecutive list items
  const renderParagraph = (paragraph: string, index: number) => {
    const lines = paragraph.split("\n").filter((line) => line.trim())
    const elements: React.ReactNode[] = []
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type === 'ol' ? 'ol' : 'ul'
        elements.push(
          <ListTag 
            key={`list-${elements.length}`} 
            className={`${currentList.type === 'ol' ? 'list-decimal' : 'list-disc'} ml-6 space-y-1 text-gray-800 dark:text-gray-200`}
          >
            {currentList.items.map((item, i) => (
              <li key={i} className="leading-relaxed">{formatInlineText(item)}</li>
            ))}
          </ListTag>
        )
        currentList = null
      }
    }

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Check if line is a quote
      if (trimmedLine.startsWith(">") || (trimmedLine.startsWith('"') && trimmedLine.endsWith('"'))) {
        flushList()
        elements.push(
          <blockquote
            key={`quote-${lineIndex}`}
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4"
          >
            {trimmedLine.replace(/^>?\s*"?|"?$/g, "")}
          </blockquote>
        )
        return
      }

      // Check if line is a header
      if (
        trimmedLine.startsWith("#") ||
        (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && /^[A-Z\s]+$/.test(trimmedLine))
      ) {
        flushList()
        elements.push(
          <h3 key={`header-${lineIndex}`} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-2">
            {trimmedLine.replace(/^#+\s*/, "")}
          </h3>
        )
        return
      }

      // Check if line is a bullet list item (starts with - or * or •)
      if (/^[-*•]\s/.test(trimmedLine)) {
        if (currentList?.type !== 'ul') {
          flushList()
          currentList = { type: 'ul', items: [] }
        }
        currentList.items.push(trimmedLine.replace(/^[-*•]\s*/, ""))
        return
      }

      // Check if line is a numbered list item
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (currentList?.type !== 'ol') {
          flushList()
          currentList = { type: 'ol', items: [] }
        }
        currentList.items.push(trimmedLine.replace(/^\d+\.\s*/, ""))
        return
      }

      // Regular paragraph text
      flushList()
      elements.push(
        <p key={`p-${lineIndex}`} className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {formatInlineText(trimmedLine)}
        </p>
      )
    })

    flushList() // Flush any remaining list items

    return <div key={index} className="space-y-3">{elements}</div>
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, index) => renderParagraph(paragraph, index))}
    </div>
  )
}

// Helper function to format inline text (bold, italic, etc.)
function formatInlineText(text: string): React.ReactNode {
  // Simple formatting for **bold** and *italic*
  let formatted: React.ReactNode = text

  // Handle **bold** text
  formatted = text.split(/(\*\*[^*]+\*\*)/).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })

  // Handle *italic* text (but not **bold**)
  if (typeof formatted === "string") {
    formatted = formatted.split(/(\*[^*]+\*)/).map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  return formatted
}

export default FormattedText
