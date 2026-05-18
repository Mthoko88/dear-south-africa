"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/rich-text-editor"
import { AICoverGenerator } from "@/components/ai-cover-generator"
import { AIRewriteAssistant } from "@/components/ai-rewrite-assistant"
import { MediaUpload } from "@/components/media-upload"
import { Sparkles, Plus } from "lucide-react"

interface EditStoryModalProps {
  story: any
  isOpen: boolean
  onClose: () => void
  onStoryUpdated?: () => void
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

export function EditStoryModal({ story, isOpen, onClose, onStoryUpdated }: EditStoryModalProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const [title, setTitle] = useState(story?.title || "")
  const [content, setContent] = useState(story?.content || "")
  const [category, setCategory] = useState(story?.category || "")
  const [contentWarning, setContentWarning] = useState(story?.content_warning || "")
  const [isAnonymous, setIsAnonymous] = useState(story?.is_anonymous || false)
  const [location, setLocation] = useState(story?.location || "")
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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(story?.cover_image || null)
  const [userProfile, setUserProfile] = useState<{ ethnicity?: string | null; gender?: string | null; full_name?: string | null }>({})
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [mediaImages, setMediaImages] = useState<string[]>(story?.media_urls || [])
  const [videoUrl, setVideoUrl] = useState<string | null>(story?.video_url || null)

  useEffect(() => {
    if (story) {
      setTitle(story.title || "")
      setContent(story.content || "")
      setCategory(story.category || "")
      setContentWarning(story.content_warning || "")
      setIsAnonymous(story.is_anonymous || false)
      setLocation(story.location || "")
      setCoverImageUrl(story.cover_image || null)
      setShowCoverGenerator(false)
      setShowAIAssistant(false)
      setMediaImages(story.media_urls || [])
      setVideoUrl(story.video_url || null)
    }
  }, [story])

  useEffect(() => {
    loadCategories()
    loadContentWarnings()
    loadUserProfile()
  }, [user])
  
  const loadUserProfile = async () => {
    if (!user || !supabase) return
    const { data } = await supabase
      .from("profiles")
      .select("ethnicity, gender, full_name")
      .eq("user_id", user.id)
      .single()
    if (data) {
      setUserProfile({ ethnicity: data.ethnicity, gender: data.gender, full_name: data.full_name })
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
        description: "Using default categories.",
        variant: "destructive",
      })
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadContentWarnings = async () => {
    try {
      const { data, error } = await supabase.from("content_warnings").select("id, name").order("name")

      if (error) throw error

      setContentWarnings(data || [])
    } catch (error) {
      console.error("Error loading content warnings:", error)
    } finally {
      setLoadingWarnings(false)
    }
  }

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  const handleSuggestTitle = async () => {
    const textContent = content.replace(/<[^>]*>/g, "").trim()

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

      if (!response.ok) {
        throw new Error("Failed to suggest title")
      }

      const data = await response.json()

      if (data.title) {
        setTitle(data.title)
        toast({
          title: "Title suggested!",
          description: "Feel free to edit the title if you'd like.",
        })
      }
    } catch (error) {
      console.error("Error suggesting title:", error)
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

  const handleUpdate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      })
      return
    }

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

    const textContent = content.replace(/<[^>]*>/g, "").trim()

    if (!textContent) {
      toast({
        title: "Content required",
        description: "Please write your story content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("stories")
        .update({
          title: title.trim(),
          content: content,
          category: category,
          content_warning: contentWarning || null,
          is_anonymous: isAnonymous,
          location: location || null,
          cover_image: coverImageUrl || (mediaImages.length > 0 ? mediaImages[0] : null),
          media_urls: mediaImages.length > 0 ? mediaImages : null,
          video_url: videoUrl || null,
        })
        .eq("id", story.id)

      if (error) throw error

      toast({
        title: "Story updated!",
        description: "Your changes have been saved.",
      })

      onClose()
      onStoryUpdated?.()
    } catch (error) {
      console.error("Error updating story:", error)
      toast({
        title: "Error",
        description: "Failed to update story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      })
      return
    }

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

    const textContent = content.replace(/<[^>]*>/g, "").trim()

    if (!textContent) {
      toast({
        title: "Content required",
        description: "Please write your story content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from("stories")
        .update({
          title: title.trim(),
          content: content,
          category: category,
          content_warning: contentWarning || null,
          is_anonymous: isAnonymous,
          location: location || null,
          is_published: true, // Set to published
        })
        .eq("id", story.id)

      if (error) throw error

      toast({
        title: "Story published!",
        description: "Your story is now live and visible to the community.",
      })

      onClose()
      onStoryUpdated?.()
    } catch (error) {
      console.error("Error publishing story:", error)
      toast({
        title: "Error",
        description: "Failed to publish story. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
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
              </div>
              <Input
                id="title"
                placeholder="Give your story a compelling title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              {showAIAssistant && (
                <AIRewriteAssistant
                  originalContent={content.replace(/<[^>]*>/g, "")}
                  onAccept={(newContent) => {
                    // Convert AI output to HTML with proper formatting
                    const lines = newContent.split("\n")
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

                      if (/^[•\-\*]\s/.test(trimmed)) {
                        if (currentList?.type !== 'ul') {
                          flushList()
                          currentList = { type: 'ul', items: [] }
                        }
                        currentList.items.push(trimmed.replace(/^[•\-\*]\s*/, ''))
                        return
                      }

                      if (/^\d+\.\s/.test(trimmed)) {
                        if (currentList?.type !== 'ol') {
                          flushList()
                          currentList = { type: 'ol', items: [] }
                        }
                        currentList.items.push(trimmed.replace(/^\d+\.\s*/, ''))
                        return
                      }

                      if (trimmed.startsWith('#') || (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && /^[A-Z\s]+$/.test(trimmed))) {
                        flushList()
                        htmlParts.push(`<h2>${trimmed.replace(/^#+\s*/, '')}</h2>`)
                        return
                      }

                      flushList()
                      htmlParts.push(`<p>${trimmed}</p>`)
                    })

                    flushList()
                    setContent(htmlParts.join(''))
                    setShowAIAssistant(false)
                  }}
                  onCancel={() => setShowAIAssistant(false)}
                />
              )}
              
              <div className="flex items-center justify-between">
                <Label htmlFor="content">
                  Your story <span className="text-red-500">*</span>
                </Label>
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
                placeholder="Share your story, experience, or thoughts with the community..."
                minHeight="400px"
              />
            </div>
            
            {/* Media Upload */}
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

            <div className="space-y-2">
              <Label>
                Category <span className="text-red-500">*</span>
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

            <div className="space-y-2">
              <Label htmlFor="content-warning">Content Warning (optional)</Label>
              <Select value={contentWarning} onValueChange={setContentWarning}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingWarnings ? "Loading warnings..." : "Select if applicable"} />
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
                <p className="text-xs text-muted-foreground">Readers will see a warning before viewing your story</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Johannesburg, Cape Town"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="anonymous" checked={isAnonymous} onCheckedChange={(checked) => setIsAnonymous(!!checked)} />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Share anonymously
              </Label>
            </div>

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

{showCoverGenerator && (
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleUpdate} disabled={loading}>
                {loading ? "Saving..." : "Save as Draft"}
              </Button>
              {!story?.is_published && (
                <Button onClick={handlePublish} disabled={loading}>
                  {loading ? "Publishing..." : "Publish Now"}
                </Button>
              )}
              {story?.is_published && (
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Updating..." : "Update Story"}
                </Button>
              )}
            </div>
          </div>
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
              <Label htmlFor="warning-name">
                Warning Name <span className="text-red-500">*</span>
              </Label>
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
