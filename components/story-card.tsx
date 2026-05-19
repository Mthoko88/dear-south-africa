"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Share2, Bookmark, Eye, Clock, MapPin, ArrowUp, ArrowDown, Flag, Building2, CheckCircle, ExternalLink } from "lucide-react"
import { ReportStoryButton } from "@/components/report-story-button"
import { ImageGridPreview } from "@/components/image-grid-preview"
import { OrganisationFollowButton } from "@/components/organisation-follow-button"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface Author {
  username?: string
  full_name?: string
  avatar_url?: string
}

interface StoryCardProps {
  story: {
    id: string
    title: string
    content?: string
    audio_url?: string
    story_type?: string
    category?: string
    content_warning?: string // Added content_warning field
    location?: string
    upvotes?: number
    downvotes?: number // Added downvotes field
    view_count?: number
    created_at: string
    user_id: string
    is_anonymous?: boolean
    cover_image?: string
    media_urls?: string[] | null
    organisation_id?: string | null
    source_url?: string | null
    profiles?: {
      username: string
      full_name?: string
      avatar_url?: string
    }
    organisations?: {
      id: string
      trading_name: string
      logo_url?: string | null
      organisation_type: string
      is_verified: boolean
    } | null
  }
}

function getEntryDate(dateString: string | null | undefined): string {
  if (!dateString) return "Unknown date"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Unknown date"

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Unknown date"
  }
}

function getMoodColor(mood?: string): string {
  if (!mood) return "bg-gray-100 text-gray-800"

  const moodColors: Record<string, string> = {
    happy: "bg-yellow-100 text-yellow-800",
    sad: "bg-blue-100 text-blue-800",
    angry: "bg-red-100 text-red-800",
    anxious: "bg-purple-100 text-purple-800",
    hopeful: "bg-green-100 text-green-800",
    grateful: "bg-pink-100 text-pink-800",
    confused: "bg-orange-100 text-orange-800",
    peaceful: "bg-teal-100 text-teal-800",
  }

  return moodColors[mood.toLowerCase()] || "bg-gray-100 text-gray-800"
}

function getCategoryColor(category?: string): string {
  if (!category) return "bg-gray-100 text-gray-800"

  const categoryColors: Record<string, string> = {
    "mental-health": "bg-purple-100 text-purple-800",
    relationships: "bg-pink-100 text-pink-800",
    career: "bg-blue-100 text-blue-800",
    family: "bg-green-100 text-green-800",
    education: "bg-indigo-100 text-indigo-800",
    health: "bg-red-100 text-red-800",
    "personal-growth": "bg-yellow-100 text-yellow-800",
    "social-issues": "bg-orange-100 text-orange-800",
    spirituality: "bg-teal-100 text-teal-800",
    other: "bg-gray-100 text-gray-800",
  }

  return categoryColors[category.toLowerCase()] || "bg-gray-100 text-gray-800"
}

// Content warning severity levels with colors
// Green = Mild, Yellow = Moderate, Orange = Strong, Red = Severe
function getContentWarningSeverity(warning?: string): { color: string; level: string } {
  if (!warning) return { color: "bg-gray-100 text-gray-800 border-gray-200", level: "none" }

  const warningLower = warning.toLowerCase()

  // Severe warnings (Red) - most harmful/triggering content
  const severeWarnings = [
    "suicide", "self-harm", "sexual assault", "rape", "child abuse", 
    "murder", "graphic violence", "torture", "human trafficking",
    "pedophilia", "incest", "gore", "death of child"
  ]
  
  // Strong warnings (Orange) - serious but less extreme
  const strongWarnings = [
    "abuse", "domestic violence", "violence", "sexual content", 
    "drug use", "addiction", "eating disorder", "assault", 
    "death", "trauma", "ptsd", "graphic content", "blood",
    "miscarriage", "stillbirth", "war", "kidnapping"
  ]
  
  // Moderate warnings (Yellow) - potentially upsetting
  const moderateWarnings = [
    "mental health", "depression", "anxiety", "bullying", 
    "discrimination", "racism", "homophobia", "grief", 
    "loss", "divorce", "cheating", "infidelity", "alcohol",
    "smoking", "gambling", "financial hardship", "poverty",
    "illness", "cancer", "terminal illness", "hospitalization"
  ]
  
  // Mild warnings (Green) - light sensitivity
  const mildWarnings = [
    "strong language", "profanity", "mild violence", "conflict",
    "family tension", "breakup", "rejection", "failure",
    "embarrassment", "controversial", "political", "religious"
  ]

  // Check severity from most severe to least
  for (const term of severeWarnings) {
    if (warningLower.includes(term)) {
      return { color: "bg-red-100 text-red-800 border-red-300", level: "severe" }
    }
  }
  
  for (const term of strongWarnings) {
    if (warningLower.includes(term)) {
      return { color: "bg-orange-100 text-orange-800 border-orange-300", level: "strong" }
    }
  }
  
  for (const term of moderateWarnings) {
    if (warningLower.includes(term)) {
      return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", level: "moderate" }
    }
  }
  
  for (const term of mildWarnings) {
    if (warningLower.includes(term)) {
      return { color: "bg-green-100 text-green-800 border-green-300", level: "mild" }
    }
  }

  // Default to moderate if unknown warning
  return { color: "bg-yellow-100 text-yellow-800 border-yellow-300", level: "moderate" }
}

export function StoryCard({ story }: StoryCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(() => {
    const upvotes = story?.upvotes
    return typeof upvotes === "number" ? upvotes : 0
  })
  const [downvoteCount, setDownvoteCount] = useState(() => {
    const downvotes = story?.downvotes
    return typeof downvotes === "number" ? downvotes : 0
  })
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [loading, setLoading] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false) // Added share dialog state
  const router = useRouter()

  useEffect(() => {
    if (user) {
      checkUserReactions()
    }
  }, [user, story.id])

  const checkUserReactions = async () => {
    if (!user) return

    try {
      const { data: voteData } = await supabase
        .from("story_reactions")
        .select("reaction_type")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .in("reaction_type", ["upvote", "downvote"])
        .maybeSingle()

      if (voteData) {
        setUserVote(voteData.reaction_type as "upvote" | "downvote")
      }

      // Check if user has bookmarked this story
      const { data: bookmarkData } = await supabase
        .from("story_bookmarks")
        .select("id")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .maybeSingle()

      setIsBookmarked(!!bookmarkData)
    } catch (error) {
      console.log("Reactions/bookmarks not available yet")
    }
  }

  const handleVote = async (voteType: "upvote" | "downvote", e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to vote on stories.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // If clicking the same vote, remove it
      if (userVote === voteType) {
        await supabase
          .from("story_reactions")
          .delete()
          .eq("story_id", story.id)
          .eq("user_id", user.id)
          .eq("reaction_type", voteType)

        // Update story counts
        if (voteType === "upvote") {
          await supabase
            .from("stories")
            .update({ upvotes: Math.max(0, upvoteCount - 1) })
            .eq("id", story.id)
          setUpvoteCount((prev) => Math.max(0, prev - 1))
        } else {
          await supabase
            .from("stories")
            .update({ downvotes: Math.max(0, downvoteCount - 1) })
            .eq("id", story.id)
          setDownvoteCount((prev) => Math.max(0, prev - 1))
        }

        setUserVote(null)
      } else {
        // If switching vote, remove old vote first
        if (userVote) {
          await supabase
            .from("story_reactions")
            .delete()
            .eq("story_id", story.id)
            .eq("user_id", user.id)
            .eq("reaction_type", userVote)

          // Update old vote count
          if (userVote === "upvote") {
            await supabase
              .from("stories")
              .update({ upvotes: Math.max(0, upvoteCount - 1) })
              .eq("id", story.id)
            setUpvoteCount((prev) => Math.max(0, prev - 1))
          } else {
            await supabase
              .from("stories")
              .update({ downvotes: Math.max(0, downvoteCount - 1) })
              .eq("id", story.id)
            setDownvoteCount((prev) => Math.max(0, prev - 1))
          }
        }

        // Add new vote
        await supabase.from("story_reactions").insert({
          story_id: story.id,
          user_id: user.id,
          reaction_type: voteType,
        })

        // Update new vote count
        if (voteType === "upvote") {
          await supabase
            .from("stories")
            .update({ upvotes: upvoteCount + 1 })
            .eq("id", story.id)
          setUpvoteCount((prev) => prev + 1)
        } else {
          await supabase
            .from("stories")
            .update({ downvotes: downvoteCount + 1 })
            .eq("id", story.id)
          setDownvoteCount((prev) => prev + 1)
        }

        setUserVote(voteType)
      }
    } catch (error) {
      console.error("Error handling vote:", error)
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsShareDialogOpen(true)
  }

  const shareToPlatform = async (platform: string) => {
    const storyUrl = `${window.location.origin}/story/${story.id}`
    const storyTitle = encodeURIComponent(story.title)
    const storyText = encodeURIComponent((story.content || "").slice(0, 100))

    let shareUrl = ""

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${storyTitle}%20${storyUrl}`
        break
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${storyUrl}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${storyTitle}&url=${storyUrl}`
        break
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${storyUrl}&text=${storyTitle}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${storyUrl}`
        break
      case "email":
        shareUrl = `mailto:?subject=${storyTitle}&body=${storyText}...%20${storyUrl}`
        break
      case "copy":
        try {
          await navigator.clipboard.writeText(storyUrl)
          toast({
            title: "Link copied",
            description: "Story link copied to clipboard.",
          })
          setIsShareDialogOpen(false)
          return
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to copy link.",
            variant: "destructive",
          })
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer")
      setIsShareDialogOpen(false)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to bookmark stories.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isBookmarked) {
        await supabase.from("story_bookmarks").delete().eq("story_id", story.id).eq("user_id", user.id)

        setIsBookmarked(false)
        toast({
          title: "Bookmark removed",
          description: "Story removed from your bookmarks.",
        })
      } else {
        await supabase.from("story_bookmarks").insert({
          story_id: story.id,
          user_id: user.id,
        })

        setIsBookmarked(true)
        toast({
          title: "Story bookmarked",
          description: "Story added to your bookmarks.",
        })
      }
    } catch (error) {
      console.error("Error handling bookmark:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      })
    }
  }

  const incrementViewCount = async () => {
    try {
      await supabase
        .from("stories")
        .update({ view_count: (story.view_count || 0) + 1 })
        .eq("id", story.id)
    } catch (error) {
      console.error("Error updating view count:", error)
    }
  }

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(" ").length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)
    return readingTime
  }

  const getInitials = (profile: any) => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const getDisplayName = (profile: any) => {
    return profile?.full_name || profile?.username || "Anonymous User"
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (!content || content.length <= maxLength) return content || ""
    return content.slice(0, maxLength) + "..."
  }

  const stripHtmlTags = (html: string) => {
    if (!html) return ""

    // Create a temporary div to parse HTML
    const temp = document.createElement("div")
    temp.innerHTML = html

    // Get text content without HTML tags
    return temp.textContent || temp.innerText || ""
  }

  const getPreviewContent = (content: string, maxLength = 200) => {
    if (!content) return ""

    // Strip HTML tags for preview
    const plainText = stripHtmlTags(content)

    // Truncate the plain text
    if (plainText.length <= maxLength) return plainText
    return plainText.slice(0, maxLength) + "..."
  }

  const goToStory = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = e.target as HTMLElement
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("audio") ||
      target.closest('[role="button"]')
    ) {
      return
    }
    
    // Navigate to story
    router.push(`/story/${story.id}`)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const safeContent = story.content || ""
  const safeCategory = story.category || "uncategorized"
  const isVoiceStory = story.story_type === "voice"

  return (
    <>
      <div role="link" tabIndex={0} onClick={goToStory} onKeyDown={(e) => e.key === "Enter" && router.push(`/story/${story.id}`)}>
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer mb-5">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Organisation posts */}
                {story.organisations && story.organisations.id ? (
                  <>
                    <div className="relative flex-shrink-0">
                      {story.organisations.logo_url ? (
                        <img
                          src={story.organisations.logo_url}
                          alt={story.organisations.trading_name}
                          className="h-10 w-10 object-contain rounded-lg border bg-white"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      {story.organisations.is_verified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-primary fill-background" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/organisation/${story.organisations.id}`}
                        className="font-medium hover:text-primary transition-colors block truncate flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {story.organisations.trading_name}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                          ORG
                        </Badge>
                      </Link>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground gap-1 sm:gap-2">
                        <span className="whitespace-nowrap">{formatDistanceToNow(new Date(story.created_at))} ago</span>
                        {story.location && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center min-w-0">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{story.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                      
                    </div>
                     
                  </>
                   
                ) : story.is_anonymous ? (
                  <>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">A</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium block truncate">Anonymous</span>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground gap-1 sm:gap-2">
                        <span className="whitespace-nowrap">{formatDistanceToNow(new Date(story.created_at))} ago</span>
                        {story.location && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center min-w-0">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{story.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={story.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(story.profiles)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      {story.profiles?.username ? (
                        <Link
                          href={`/profile/${story.profiles.username}`}
                          className="font-medium hover:text-primary transition-colors block truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {getDisplayName(story.profiles)}
                        </Link>
                      ) : (
                        <span className="font-medium block truncate">{getDisplayName(story.profiles)}</span>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs text-muted-foreground gap-1 sm:gap-2">
                        <span className="whitespace-nowrap">{formatDistanceToNow(new Date(story.created_at))} ago</span>
                        {story.location && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <div className="flex items-center min-w-0">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{story.location}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-1.5 flex-shrink-0 items-end sm:items-center">
                <Badge variant="secondary" className={`text-xs max-w-[100px] sm:max-w-none truncate ${getCategoryColor(safeCategory)}`}>
                  <span className="truncate">{safeCategory.replace(/-/g, " ")}</span>
                </Badge>
                {story.content_warning && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 h-4 max-w-[100px] sm:max-w-none border ${getContentWarningSeverity(story.content_warning).color}`}
                    title={`Content Warning: ${story.content_warning}`}
                  >
                    <span className="truncate">{"⚠️ "}{story.content_warning.length > 8 ? story.content_warning.slice(0, 8) + "..." : story.content_warning}</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Organisation Follow Button - moved outside header */}
            {story.organisations?.id && (
              <div onClick={(e) => e.stopPropagation()} className="pt-2 border-t mt-3">
                <OrganisationFollowButton 
                  organisationId={story.organisations.id} 
                  variant="outline"
                  className="text-xs w-full"
                />
              </div>
            )}
          </CardHeader>

<CardContent className="pt-0">
  <div className="space-y-3">
  <h3 className="font-bold font-serif text-2xl hover:text-primary transition-colors line-clamp-2">{story.title}</h3>
  {(story.cover_image || (story.media_urls && story.media_urls.length > 0)) && (
    <ImageGridPreview 
      images={story.media_urls || []} 
      coverImage={story.cover_image}
    />
  )}

              {isVoiceStory && story.audio_url ? (
                <div className="bg-muted rounded-lg p-3">
                  <audio src={story.audio_url} controls className="w-full" preload="metadata" />
                </div>
              ) : (
                <p className="font-serif text-muted-foreground leading-relaxed line-clamp-3">{getPreviewContent(safeContent)}</p>
              )}

              {/* Source URL indicator */}
              {story.source_url && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  <span>Originally from:</span>
                  <a 
                    href={story.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(story.source_url).hostname}
                  </a>
                </div>
              )}

              {/* Story stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-2 sm:gap-3">
                <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{story.view_count || 0}</span>
                  </div>
                  {!isVoiceStory && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{getReadingTime(safeContent)} min</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleVote("upvote", e)}
                    disabled={loading}
                    className={`h-7 sm:h-8 px-1.5 sm:px-2 ${userVote === "upvote" ? "text-green-600 bg-green-50" : ""}`}
                  >
                    <ArrowUp className={`h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 ${userVote === "upvote" ? "fill-current" : ""}`} />
                    <span className="text-[10px] sm:text-xs">{upvoteCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleVote("downvote", e)}
                    disabled={loading}
                    className={`h-7 sm:h-8 px-1.5 sm:px-2 ${userVote === "downvote" ? "text-red-600 bg-red-50" : ""}`}
                  >
                    <ArrowDown className={`h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 ${userVote === "downvote" ? "fill-current" : ""}`} />
                    <span className="text-[10px] sm:text-xs">{downvoteCount}</span>
                  </Button>

                  <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2">
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                    <span className="text-[10px] sm:text-xs">0</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2">
                        <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={handleBookmark}>
                        <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current text-blue-500" : ""}`} />
                        {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <div>
                          <ReportStoryButton storyId={story.id} storyAuthorId={story.user_id} variant="dropdown" />
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>
            <DialogDescription>Choose a platform to share this story</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("whatsapp")}
            >
              <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              <span className="text-sm">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("facebook")}
            >
              <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("twitter")}
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <span className="text-sm">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("telegram")}
            >
              <svg className="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              <span className="text-sm">Telegram</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("linkedin")}
            >
              <svg className="h-6 w-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="text-sm">LinkedIn</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
              onClick={() => shareToPlatform("email")}
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Email</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 col-span-2 bg-transparent"
              onClick={() => shareToPlatform("copy")}
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Copy Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
