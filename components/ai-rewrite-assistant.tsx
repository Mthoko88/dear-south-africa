"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, RefreshCw, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AIRewriteAssistantProps {
  originalContent: string
  onAccept: (rewrittenContent: string) => void
  onCancel: () => void
}

const SOUTH_AFRICAN_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "afrikaans", label: "Afrikaans" },
  { value: "zulu", label: "IsiZulu" },
  { value: "xhosa", label: "IsiXhosa" },
  { value: "sotho", label: "Sesotho" },
  { value: "tswana", label: "Setswana" },
  { value: "pedi", label: "Sepedi" },
  { value: "venda", label: "Tshivenda" },
  { value: "tsonga", label: "Xitsonga" },
  { value: "swati", label: "SiSwati" },
  { value: "ndebele", label: "IsiNdebele" },
]

export function AIRewriteAssistant({ originalContent, onAccept, onCancel }: AIRewriteAssistantProps) {
  const [isRewriting, setIsRewriting] = useState(false)
  const [rewrittenContent, setRewrittenContent] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState("english")
  const { toast } = useToast()

  const handleRewrite = async () => {
    if (!originalContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write or paste your story first.",
        variant: "destructive",
      })
      return
    }

    setIsRewriting(true)

    try {
      const response = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: originalContent,
          language: selectedLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rewrite content")
      }

      const data = await response.json()
      setRewrittenContent(data.rewrittenContent)

      toast({
        title: "Story edited!",
        description: "Review the corrected version below.",
      })
    } catch (error) {
      console.error("Rewrite error:", error)
      toast({
        title: "Edit failed",
        description: "Could not edit your story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRewriting(false)
    }
  }

  const handleAcceptRewrite = () => {
    if (rewrittenContent) {
      onAccept(rewrittenContent)
      toast({
        title: "Changes applied!",
        description: "Your story has been updated.",
      })
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-lg">AI Editor</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Let our AI fix grammar and spelling, add proper paragraph breaks, and improve readability while keeping your exact words and meaning.
      </p>

      <div className="space-y-2">
        <Label>Language of your story</Label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOUTH_AFRICAN_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!rewrittenContent ? (
        <div className="flex gap-2">
          <Button onClick={handleRewrite} disabled={isRewriting} className="flex-1">
            {isRewriting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Editing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Edit with AI
              </>
            )}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border rounded-lg p-4 bg-white dark:bg-gray-950 max-h-[300px] overflow-y-auto">
            <h4 className="font-medium text-sm mb-2 text-muted-foreground">Edited version:</h4>
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">{rewrittenContent}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAcceptRewrite} className="flex-1">
              <Check className="mr-2 h-4 w-4" />
              Use This Version
            </Button>
            <Button onClick={() => setRewrittenContent(null)} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onCancel} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Keep Original
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
