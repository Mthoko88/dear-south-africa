"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = "400px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [wordCount, setWordCount] = useState(0)
  const isInternalChange = useRef(false)

  // Sync external value changes
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const currentHTML = editorRef.current.innerHTML
      if (value !== currentHTML) {
        editorRef.current.innerHTML = value || ""
      }
    }
    isInternalChange.current = false
  }, [value])

  // Count words
  useEffect(() => {
    const text = editorRef.current?.innerText || ""
    const words = text.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key - insert proper paragraph break
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      
      // Insert a new paragraph
      document.execCommand("insertParagraph", false)
      handleInput()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()

    // Get plain text
    const text = e.clipboardData.getData("text/plain")
    
    if (!text) return

    // Convert text to paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
    const html = paragraphs.map(p => {
      // Replace single newlines with <br>
      const withBreaks = p.replace(/\n/g, "<br>")
      return `<p>${withBreaks}</p>`
    }).join("")

    // Insert the HTML
    document.execCommand("insertHTML", false, html)
    handleInput()
  }

  const execCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue)
    editorRef.current?.focus()
    handleInput()
  }

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("bold")} title="Bold (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("italic")} title="Italic (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "<h2>")}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("undo")} title="Undo (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("redo")} title="Redo (Ctrl+Y)">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background prose prose-sm max-w-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Word Counter */}
      <div className="text-sm text-muted-foreground text-right">
        {wordCount} {wordCount === 1 ? "word" : "words"}
      </div>

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          white-space: pre-wrap;
        }
        [contenteditable] {
          line-height: 1.75;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        [contenteditable] p {
          margin-bottom: 1.25em;
          min-height: 1.75em;
        }
        [contenteditable] p:last-child {
          margin-bottom: 0;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin-left: 1.5em;
          margin-bottom: 1.25em;
        }
        [contenteditable] li {
          margin-bottom: 0.5em;
        }
        [contenteditable] br {
          display: block;
          content: "";
          margin-top: 0.5em;
        }
      `}</style>
    </div>
  )
}
