"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ImageIcon, RefreshCw, Check, X, Sparkles, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AICoverGeneratorProps {
  title: string
  content: string
  category: string
  userEthnicity?: string | null
  userGender?: string | null
  userFullName?: string | null
  onAccept: (imageUrl: string) => void
  onCancel: () => void
}

export function AICoverGenerator({ title, content, category, userEthnicity, userGender, userFullName, onAccept, onCancel }: AICoverGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const generatedImageRef = useRef<string | null>(null)
  const { toast } = useToast()

  const handleGenerate = async () => {
    const textContent = content.replace(/<[^>]*>/g, "").trim()
    
    if (!title && !textContent) {
      toast({
        title: "Content required",
        description: "Please add a title or write your story first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/ai-generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: textContent,
          category,
          userEthnicity,
          userGender,
          userFullName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate cover image")
      }

      const data = await response.json()
      generatedImageRef.current = data.imageUrl
      setGeneratedImage(data.imageUrl)

      toast({
        title: "Cover image generated!",
        description: "Review your story cover below.",
      })
    } catch (error) {
      console.error("Cover generation error:", error)
      toast({
        title: "Generation failed",
        description: "Could not generate cover image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title || "story"}-cover.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive",
      })
    }
  }

  const handleAccept = () => {
    const imageUrl = generatedImageRef.current || generatedImage
    if (imageUrl) {
      onAccept(imageUrl)
      toast({
        title: "Cover image added!",
        description: "Your story now has a cover image.",
      })
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-amber-600" />
        <h3 className="font-semibold text-lg">AI Cover Image Generator</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Generate a beautiful cover image for your story using AI. The image will capture the emotional essence of your story with South African visual elements.
      </p>

      {!generatedImage ? (
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Cover Image
              </>
            )}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border shadow-lg">
            <Image
              src={generatedImage || "/placeholder.svg"}
              alt="Generated story cover"
              fill
              className="object-cover"
            />
          </div>

          <p className="text-sm text-center text-amber-700 dark:text-amber-400 font-medium">
            Click "Use This Cover" to add this image to your story
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              onClick={handleAccept} 
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg animate-pulse hover:animate-none transition-all duration-300 ring-2 ring-amber-300 ring-offset-2"
            >
              <Check className="mr-2 h-4 w-4" />
              Use This Cover
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 sm:flex-none bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={() => setGeneratedImage(null)} variant="outline" className="flex-1 sm:flex-none">
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Again
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 sm:flex-none bg-transparent">
              <X className="mr-2 h-4 w-4" />
              Skip
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
