"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Share2, FileText, BookOpen, Sparkles, Plus, Building2 } from "lucide-react"
import { StoryTypeSelector } from "@/components/story-type-selector"
import { VoiceRecorder } from "@/components/voice-recorder"
import { RichTextEditor } from "@/components/rich-text-editor"
import { AIRewriteAssistant } from "@/components/ai-rewrite-assistant"
import { AICoverGenerator } from "@/components/ai-cover-generator"
import { MediaUpload } from "@/components/media-upload"
import { LinkPreview } from "@/components/link-preview"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface CreateStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onStoryCreated?: () => void
  initialStoryType?: "written" | "voice" | null
}

const CONTENT_WARNINGS = [
  "Violence",
  "Abuse",
  "Mental Health",
  "Substance Use",
  "Death/Loss",
  "Discrimination",
  "Financial Hardship",
  "Medical Content",
  "Trauma",
]

export function CreateStoryModal({ isOpen, onClose, onStoryCreated, initialStoryType }: CreateStoryModalProps) {
  const [activeTab, setActiveTab] = useState<"share" | "draft" | "diary">("share")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [contentWarning, setContentWarning] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [location, setLocation] = useState("")
  const [mood, setMood] = useState("neutral")
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [storyType, setStoryType] = useState<"written" | "voice" | "link" | null>(initialStoryType || null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [categories, setCategories] = useState<Array<{ slug: string; name: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [showSuggestCategory, setShowSuggestCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [contentWarnings, setContentWarnings] = useState<Array<{ id: string; name: string }>>([])
  const [loadingWarnings, setLoadingWarnings] = useState(true)
  const [showSuggestWarning, setShowSuggestWarning] = useState(false)
  const [newWarningName, setNewWarningName] = useState("")
  const [newWarningDescription, setNewWarningDescription] = useState("")
  const [showCoverGenerator, setShowCoverGenerator] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<{ ethnicity?: string | null; gender?: string | null; full_name?: string | null; is_admin?: boolean; organisation_id?: string | null }>({})
  const [mediaImages, setMediaImages] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [userOrganisation, setUserOrganisation] = useState<{ id: string; trading_name: string; logo_url?: string | null } | null>(null)
  const [postAsOrganisation, setPostAsOrganisation] = useState(false)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [showLinkImport, setShowLinkImport] = useState(false)

  useEffect(() => {
    loadCategories()
    loadContentWarnings()
    loadUserProfile()
  }, [user])
  
  const loadUserProfile = async () => {
    if (!user || !supabase) return
    const { data } = await supabase
      .from("profiles")
      .select("ethnicity, gender, full_name, is_admin, organisation_id")
      .eq("user_id", user.id)
      .single()
    if (data) {
      setUserProfile({ 
        ethnicity: data.ethnicity, 
        gender: data.gender, 
        full_name: data.full_name,
        is_admin: data.is_admin,
        organisation_id: data.organisation_id
      })
      
      // If user has an organisation, fetch it
      if (data.organisation_id) {
        const { data: orgData } = await supabase
          .from("organisations")
          .select("id, trading_name, logo_url")
          .eq("id", data.organisation_id)
          .single()
        if (orgData) {
          setUserOrganisation(orgData)
        }
      }
    }
  }

  const loadContentWarnings = async () => {
    try {
      const { data, error } = await supabase.from("content_warnings").select("id, name").order("name")

      if (error) throw error

      setContentWarnings(data || [])
    } catch (error) {
      console.error("Error loading content warnings:", error)
      toast({
        title: "Failed to load content warnings",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingWarnings(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("slug, name").order("name")

      if (error) throw error

      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "Failed to load categories",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    if (initialStoryType) {
      setStoryType(initialStoryType)
      setShowTypeSelector(false)
    }
  }, [initialStoryType])

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategory("")
    setContentWarning("")
    setIsAnonymous(false)
    setLocation("")
    setMood("neutral")
    setStoryType(null)
    setAudioUrl(null)
    setAudioDuration(0)
    setWordCount(0)
    setCoverImageUrl(null)
    setShowCoverGenerator(false)
    setSourceUrl(null)
    setShowLinkImport(false)
  }

const handleStoryTypeSelect = (type: "written" | "voice" | "link") => {
    if (type === "link") {
      setShowTypeSelector(false)
      setShowLinkImport(true)
    } else {
      setStoryType(type)
      setShowTypeSelector(false)
    }
  }

const handleAudioReady = (url: string, duration: number) => {
    setAudioUrl(url)
    setAudioDuration(duration)
  }

  const handleImportMetadata = (data: { title: string; description: string; image: string | null; sourceUrl: string }) => {
    setTitle(data.title)
    setContent(`<p>${data.description}</p>`)
    if (data.image) {
      setCoverImageUrl(data.image)
    }
    setSourceUrl(data.sourceUrl)
    setStoryType("written")
    setShowLinkImport(false)
    toast({
      title: "Content imported",
      description: "Title and summary imported. You can edit before sharing.",
    })
  }

  const handleImportFullArticle = (data: { title: string; content: string; image: string | null; sourceUrl: string }) => {
    setTitle(data.title)
    setContent(data.content)
    if (data.image) {
      setCoverImageUrl(data.image)
    }
    setSourceUrl(data.sourceUrl)
    setStoryType("written")
    setShowLinkImport(false)
    toast({
      title: "Full article imported",
      description: "You can edit the content before sharing.",
    })
  }

  const handleCancelLinkImport = () => {
    setShowLinkImport(false)
    setShowTypeSelector(true)
  }

  const handleVoiceCancel = () => {
    setStoryType(null)
    setAudioUrl(null)
    setAudioDuration(0)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    const allowedExtensions = [".txt", ".pdf", ".doc", ".docx"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt, .pdf, .doc, or .docx file.",
        variant: "destructive",
      })
      event.target.value = ""
      return
    }

    setIsUploadingFile(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to extract text")
      }

      const { text } = await response.json()

      // Convert plain text to HTML paragraphs
      const htmlContent = text
        .split("\n\n")
        .filter((para: string) => para.trim())
        .map((para: string) => `<p>${para.trim()}</p>`)
        .join("")

      setContent(htmlContent || text)

      toast({
        title: "File uploaded successfully",
        description: "Your story has been loaded. You can edit it before sharing.",
      })
    } catch (error) {
      console.error("[v0] File upload error:", error)
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not read the file. Please try copying and pasting your story instead.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingFile(false)
      event.target.value = ""
    }
  }

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  const handleAcceptAIRewrite = (rewrittenContent: string) => {
    // Convert AI output to HTML with proper formatting
    const lines = rewrittenContent.split("\n")
    const htmlParts: string[] = []
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

    const flushList = () => {
      if (currentList) {
        const tag = currentList.type === 'ol' ? 'ol' : 'ul'
        htmlParts.push(`<${tag}>${currentList.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`)
        currentList = null
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) {
        flushList()
        return
      }

      // Check for bullet points
      if (/^[•\-\*]\s/.test(trimmed)) {
        if (currentList?.type !== 'ul') {
          flushList()
          currentList = { type: 'ul', items: [] }
        }
        currentList.items.push(trimmed.replace(/^[•\-\*]\s*/, ''))
        return
      }

      // Check for numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        if (currentList?.type !== 'ol') {
          flushList()
          currentList = { type: 'ol', items: [] }
        }
        currentList.items.push(trimmed.replace(/^\d+\.\s*/, ''))
        return
      }

      // Check for headers (ALL CAPS or starts with #)
      if (trimmed.startsWith('#') || (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && /^[A-Z\s]+$/.test(trimmed))) {
        flushList()
        htmlParts.push(`<h2>${trimmed.replace(/^#+\s*/, '')}</h2>`)
        return
      }

      // Regular paragraph
      flushList()
      htmlParts.push(`<p>${trimmed}</p>`)
    })

    flushList()
    setContent(htmlParts.join(''))
    setShowAIAssistant(false)
  }

  const handleSubmit = async (action: "share" | "draft" | "diary") => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      })
      return
    }

    if (storyType === "voice" && !audioUrl) {
      toast({
        title: "Audio required",
        description: "Please record your story.",
        variant: "destructive",
      })
      return
    }

    const textContent = content.replace(/<[^>]*>/g, "").trim()

    if (storyType === "written" && !textContent) {
      toast({
        title: "Content required",
        description: "Please write your story content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (action === "diary") {
        const { error } = await supabase.from("diary_entries").insert({
          user_id: user.id,
          title: title || "Untitled Entry",
          content: storyType === "written" ? content : null,
          audio_url: storyType === "voice" ? audioUrl : null,
          entry_type: storyType || "written",
          mood: mood,
          is_private: true,
          entry_date: new Date().toISOString().split("T")[0],
        })

        if (error) throw error

        toast({
          title: "Diary entry saved!",
          description: "Your private entry has been saved to your diary.",
        })
      } else {
        if (!title.trim()) {
          toast({
            title: "Title required",
            description: "Please add a title for your story.",
            variant: "destructive",
          })
          return
        }

        if (!category) {
          toast({
            title: "Category required",
            description: "Please select a category.",
            variant: "destructive",
          })
          return
        }

        const { error } = await supabase.from("stories").insert({
          user_id: user.id,
          title: title.trim(),
          content: storyType === "written" ? content : null,
          audio_url: storyType === "voice" ? audioUrl : null,
          story_type: storyType || "written",
          category: category,
          content_warning: contentWarning || null,
          is_anonymous: isAnonymous,
          location: location || null,
          is_published: action === "share",
          upvotes: 0,
          downvotes: 0,
          view_count: 0,
cover_image: coverImageUrl || (mediaImages.length > 0 ? mediaImages[0] : null),
        media_urls: mediaImages.length > 0 ? mediaImages : null,
          video_url: videoUrl || null,
          organisation_id: postAsOrganisation && userOrganisation ? userOrganisation.id : null,
          source_url: sourceUrl || null,
        })

        if (error) throw error

        toast({
          title: action === "share" ? "Story shared!" : "Draft saved!",
          description:
            action === "share"
              ? "Your story has been shared with the community."
              : "Your story has been saved as a draft.",
        })
      }

      resetForm()
      onClose()
      onStoryCreated?.()
    } catch (error) {
      console.error("Error saving:", error)
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleModalChange = (open: boolean) => {
    if (open && !storyType && !initialStoryType && activeTab !== "diary") {
      setShowTypeSelector(true)
    } else if (!open) {
      resetForm()
      setShowTypeSelector(false)
      onClose()
    }
  }

  const handleTabChange = (tab: "share" | "draft" | "diary") => {
    setActiveTab(tab)

    if (tab === "diary") {
      if (!storyType) {
        setShowTypeSelector(true)
      }
    } else if (tab === "share" || tab === "draft") {
      if (!storyType) {
        setShowTypeSelector(true)
      }
    }
  }

  const handleSuggestTitle = async () => {
    const textContent = content.replace(/<[^>]*>/g, "").trim()

    console.log("[v0] Suggesting title for content length:", textContent.length)

    if (!textContent) {
      toast({
        title: "Content required",
        description: "Please write your story first, then I can suggest a title.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingTitle(true)

    try {
      const response = await fetch("/api/ai-suggest-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textContent }),
      })

      console.log("[v0] Title suggestion response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] Title suggestion error:", errorData)
        throw new Error("Failed to suggest title")
      }

      const data = await response.json()
      console.log("[v0] Received title:", data.title)

      if (data.title) {
        setTitle(data.title)
        toast({
          title: "Title suggested!",
          description: "Feel free to edit the title if you'd like.",
        })
      }
    } catch (error) {
      console.error("[v0] Error suggesting title:", error)
      toast({
        title: "Failed to suggest title",
        description: "Please try again or write your own title.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTitle(false)
    }
  }

  const handleSuggestCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a category name.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/categories/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create category")
      }

      const { category: newCategory } = await response.json()

      toast({
        title: "Category created!",
        description: "Your category has been added.",
      })

      // Refresh categories and select the new one
      await loadCategories()
      setCategory(newCategory.slug)
      setShowSuggestCategory(false)
      setNewCategoryName("")
      setNewCategoryDescription("")
    } catch (error) {
      console.error("Error suggesting category:", error)
      toast({
        title: "Failed to create category",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSuggestWarning = async () => {
    if (!newWarningName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a warning name.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("content_warnings")
        .insert({
          name: newWarningName.trim(),
          description: newWarningDescription.trim() || null,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Content warning added!",
        description: "Your warning has been added.",
      })

      // Refresh warnings and select the new one
      await loadContentWarnings()
      setContentWarning(data.name)
      setShowSuggestWarning(false)
      setNewWarningName("")
      setNewWarningDescription("")
    } catch (error) {
      console.error("Error suggesting warning:", error)
      toast({
        title: "Failed to add warning",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <StoryTypeSelector
        open={showTypeSelector}
        onClose={() => {
          setShowTypeSelector(false)
          onClose()
        }}
        onSelectType={handleStoryTypeSelect}
        isOrganisationUser={!!userOrganisation}
        organisationName={userOrganisation?.trading_name}
      />

      <LinkPreview
        open={showLinkImport}
        onClose={handleCancelLinkImport}
        onImportMetadata={handleImportMetadata}
        onImportFullArticle={handleImportFullArticle}
      />

      <Dialog open={isOpen && !showTypeSelector && !showLinkImport} onOpenChange={handleModalChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "share"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange("share")}
            >
              <div className="flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share Story</span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "draft"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange("draft")}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Save Draft</span>
              </div>
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === "diary"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange("diary")}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Diary Entry</span>
              </div>
            </button>
          </div>

          {storyType === "voice" && !audioUrl ? (
            <VoiceRecorder onAudioReady={handleAudioReady} onCancel={handleVoiceCancel} />
          ) : (
            <>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">
                      Title {activeTab !== "diary" && <span className="text-red-500">*</span>}
                    </Label>
                    {storyType === "written" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSuggestTitle}
                        disabled={isGeneratingTitle || !content.replace(/<[^>]*>/g, "").trim()}
                        className="h-7 text-xs"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        {isGeneratingTitle ? "Suggesting..." : "Suggest Title"}
                      </Button>
                    )}
                  </div>
                  <Input
                    id="title"
                    placeholder={
                      activeTab === "diary"
                        ? "Entry title (optional)"
                        : storyType === "voice"
                          ? "Give your voice story a title"
                          : "Give your story a compelling title"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {sourceUrl && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <span>Imported from:</span>
                      <a 
                        href={sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-[300px]"
                      >
                        {sourceUrl}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1 ml-auto"
                        onClick={() => setSourceUrl(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                {storyType === "voice" && audioUrl && (
                  <div className="space-y-2">
                    <Label>Your Voice Recording</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      <audio src={audioUrl} controls className="w-full" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Duration: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioUrl(null)
                            setAudioDuration(0)
                          }}
                        >
                          Re-record
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Written Story Editor */}
                {storyType === "written" && (
                  <div className="space-y-4">
                    {showAIAssistant && (
                      <AIRewriteAssistant
                        originalContent={content.replace(/<[^>]*>/g, "")}
                        onAccept={handleAcceptAIRewrite}
                        onCancel={() => setShowAIAssistant(false)}
                      />
                    )}

                    <div className="flex items-center justify-between">
                      <Label>Your Story</Label>
                      {!showAIAssistant && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAIAssistant(true)}
                          className="h-7 text-xs"
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          Edit with AI
                        </Button>
                      )}
                    </div>

                    <RichTextEditor
                      value={content}
                      onChange={handleContentChange}
                      placeholder={
                        activeTab === "diary"
                          ? "Write about your day, thoughts, feelings, or experiences...\n\nUse the formatting toolbar above to add headings, bold text, lists, and more. Feel free to write as much as you need."
                          : "Share your story, experience, or thoughts with the community...\n\nUse the formatting toolbar to make your story more engaging with headings, bold text, lists, and more. Take your time and write as much as you'd like."
                      }
                      minHeight="400px"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category {activeTab !== "diary" && <span className="text-red-500">*</span>}
                  </Label>
                  <Select value={category} onValueChange={setCategory} disabled={loadingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      <div className="border-t mt-1 pt-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowSuggestCategory(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Suggest New Category
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {activeTab !== "diary" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="content-warning">Content Warning (optional)</Label>
                      <Select value={contentWarning} onValueChange={setContentWarning}>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingWarnings ? "Loading warnings..." : "Select if story contains sensitive content"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {contentWarnings.map((warning) => (
                            <SelectItem key={warning.id} value={warning.name}>
                              {warning.name}
                            </SelectItem>
                          ))}
                          <div className="border-t mt-2 pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setShowSuggestWarning(true)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Suggest New Warning
                            </Button>
                          </div>
                        </SelectContent>
                      </Select>
                      {contentWarning && (
                        <p className="text-xs text-muted-foreground">
                          Readers will see a warning before viewing your story
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location (optional)</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Cape Town, Johannesburg, etc."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="anonymous" 
                        checked={isAnonymous} 
                        onCheckedChange={(checked) => {
                          setIsAnonymous(checked === true)
                          if (checked) setPostAsOrganisation(false)
                        }}
                        disabled={postAsOrganisation}
                      />
                      <Label htmlFor="anonymous" className={postAsOrganisation ? "text-muted-foreground" : ""}>
                        Share anonymously
                      </Label>
                    </div>

                    {/* Post as Organisation Toggle - only show if user has an organisation */}
                    {userOrganisation && (
                      <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/30">
                        <Checkbox 
                          id="post-as-org" 
                          checked={postAsOrganisation} 
                          onCheckedChange={(checked) => {
                            setPostAsOrganisation(checked === true)
                            if (checked) setIsAnonymous(false)
                          }}
                        />
                        <div className="flex items-center gap-2">
                          {userOrganisation.logo_url ? (
                            <img 
                              src={userOrganisation.logo_url} 
                              alt={userOrganisation.trading_name}
                              className="h-6 w-6 rounded object-contain border bg-white"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded border bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-3 w-3 text-primary" />
                            </div>
                          )}
                          <Label htmlFor="post-as-org" className="cursor-pointer">
                            Post as <span className="font-semibold">{userOrganisation.trading_name}</span>
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* AI Cover Image Generator */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Cover Image (optional)</Label>
                        {!coverImageUrl && !showCoverGenerator && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCoverGenerator(true)}
                            disabled={!title && !content.replace(/<[^>]*>/g, "").trim()}
                          >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate with AI
                          </Button>
                        )}
                      </div>

                      {showCoverGenerator && !coverImageUrl && (
                        <AICoverGenerator
                          title={title}
                          content={content}
                          category={category}
                          userEthnicity={userProfile.ethnicity}
                          userGender={userProfile.gender}
                          userFullName={userProfile.full_name}
                          onAccept={(imageUrl) => {
                            setCoverImageUrl(imageUrl)
                            setShowCoverGenerator(false)
                          }}
                          onCancel={() => setShowCoverGenerator(false)}
                        />
                      )}

                      {coverImageUrl && (
                        <div className="space-y-2">
                          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border">
                            <img
                              src={coverImageUrl || "/placeholder.svg"}
                              alt="Story cover"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCoverImageUrl(null)
                                setShowCoverGenerator(true)
                              }}
                            >
                              Generate New
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCoverImageUrl(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Media Upload Section */}
                    <div className="space-y-2">
                      <Label>Photos & Video (optional)</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add up to 5 photos and/or 1 video to enhance your story
                      </p>
                      <MediaUpload
                        images={mediaImages}
                        videoUrl={videoUrl}
                        onImagesChange={setMediaImages}
                        onVideoChange={setVideoUrl}
                        maxImages={5}
                      />
                    </div>
                  </>
                )}

                {activeTab === "diary" && (
                  <div className="space-y-2">
                    <Label>Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger>
                        <SelectValue placeholder="How are you feeling?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">😊 Happy</SelectItem>
                        <SelectItem value="grateful">🙏 Grateful</SelectItem>
                        <SelectItem value="excited">🎉 Excited</SelectItem>
                        <SelectItem value="peaceful">😌 Peaceful</SelectItem>
                        <SelectItem value="hopeful">🌟 Hopeful</SelectItem>
                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                        <SelectItem value="tired">😴 Tired</SelectItem>
                        <SelectItem value="stressed">😰 Stressed</SelectItem>
                        <SelectItem value="anxious">😟 Anxious</SelectItem>
                        <SelectItem value="sad">😢 Sad</SelectItem>
                        <SelectItem value="frustrated">😤 Frustrated</SelectItem>
                        <SelectItem value="overwhelmed">😵 Overwhelmed</SelectItem>
                        <SelectItem value="angry">😠 Angry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSubmit(activeTab)}
                  disabled={loading || (!content.replace(/<[^>]*>/g, "").trim() && storyType === "written")}
                >
                  {loading
                    ? "Saving..."
                    : activeTab === "share"
                      ? "Share Story"
                      : activeTab === "draft"
                        ? "Save Draft"
                        : "Save to Diary"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center mt-4">
                {activeTab === "share" && (
                  <div className="flex items-center justify-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>This story will be visible to the community</span>
                  </div>
                )}
                {activeTab === "draft" && (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>This draft will be private until you publish it</span>
                  </div>
                )}
                {activeTab === "diary" && (
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>This entry will be completely private</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showSuggestCategory} onOpenChange={setShowSuggestCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest New Category</DialogTitle>
            <DialogDescription>Help us expand our categories by suggesting a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder="e.g., Xenophobia, Crime & Violence"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description (optional)</Label>
              <Input
                id="category-description"
                placeholder="Brief description of this category"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSuggestCategory(false)}>
                Cancel
              </Button>
              <Button onClick={handleSuggestCategory}>Create Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuggestWarning} onOpenChange={setShowSuggestWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest Content Warning</DialogTitle>
            <DialogDescription>
              Add a new content warning to help readers prepare for sensitive topics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="warning-name">Warning Name *</Label>
              <Input
                id="warning-name"
                placeholder="e.g., Domestic Violence"
                value={newWarningName}
                onChange={(e) => setNewWarningName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warning-description">Description (optional)</Label>
              <Input
                id="warning-description"
                placeholder="Brief description of what this warning covers"
                value={newWarningDescription}
                onChange={(e) => setNewWarningDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSuggestWarning(false)}>
                Cancel
              </Button>
              <Button onClick={handleSuggestWarning}>Add Warning</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
