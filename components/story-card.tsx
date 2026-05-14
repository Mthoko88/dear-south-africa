"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  MapPin,
  ArrowUp,
  ArrowDown,
  Building2,
  CheckCircle,
  ExternalLink,
} from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

import { ReportStoryButton } from "@/components/report-story-button"
import { ImageGridPreview } from "@/components/image-grid-preview"
import { OrganisationFollowButton } from "@/components/organisation-follow-button"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface StoryCardProps {
  story: {
    id: string
    title: string
    content?: string
    audio_url?: string
    story_type?: string
    category?: string
    content_warning?: string
    location?: string
    upvotes?: number
    downvotes?: number
    view_count?: number
    created_at: string
    user_id: string
    is_anonymous?: boolean
    cover_image?: string
    media_urls?: string[] | null
    organisation_id?: string | null
    source_url?: string | null

    profiles?: {
      username?: string
      full_name?: string
      avatar_url?: string
    }

    organisations?: {
      id: string
      trading_name: string
      logo_url?: string | null
      organisation_type?: string
      is_verified?: boolean
    } | null
  }
}

function getCategoryColor(category?: string) {
  if (!category) return "bg-gray-100 text-gray-800"

  const colors: Record<string, string> = {
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

  return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800"
}

function getContentWarningSeverity(warning?: string) {
  if (!warning) {
    return {
      color: "bg-gray-100 text-gray-800 border-gray-200",
    }
  }

  const lower = warning.toLowerCase()

  const severe = [
    "suicide",
    "self-harm",
    "sexual assault",
    "rape",
    "child abuse",
    "murder",
    "graphic violence",
  ]

  const strong = [
    "abuse",
    "violence",
    "drug use",
    "addiction",
    "death",
    "trauma",
  ]

  const moderate = [
    "mental health",
    "depression",
    "anxiety",
    "bullying",
    "grief",
    "loss",
  ]

  const mild = [
    "strong language",
    "profanity",
    "conflict",
    "breakup",
  ]

  for (const item of severe) {
    if (lower.includes(item)) {
      return {
        color: "bg-red-100 text-red-800 border-red-300",
      }
    }
  }

  for (const item of strong) {
    if (lower.includes(item)) {
      return {
        color: "bg-orange-100 text-orange-800 border-orange-300",
      }
    }
  }

  for (const item of moderate) {
    if (lower.includes(item)) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      }
    }
  }

  for (const item of mild) {
    if (lower.includes(item)) {
      return {
        color: "bg-green-100 text-green-800 border-green-300",
      }
    }
  }

  return {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  }
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [upvoteCount, setUpvoteCount] = useState(story.upvotes || 0)
  const [downvoteCount, setDownvoteCount] = useState(story.downvotes || 0)

  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const safeContent = story.content || ""
  const safeCategory = story.category || "other"
  const isVoiceStory = story.story_type === "voice"

  useEffect(() => {
    if (user) {
      checkUserReactions()
    }
  }, [user, story.id])

  const checkUserReactions = async () => {
    try {
      if (!user) return

      const { data: voteData } = await supabase
        .from("story_reactions")
        .select("reaction_type")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .maybeSingle()

      if (voteData?.reaction_type) {
        setUserVote(voteData.reaction_type)
      }

      const { data: bookmarkData } = await supabase
        .from("story_bookmarks")
        .select("id")
        .eq("story_id", story.id)
        .eq("user_id", user.id)
        .maybeSingle()

      setIsBookmarked(!!bookmarkData)
    } catch (error) {
      console.log(error)
    }
  }

  const handleVote = async (
    voteType: "upvote" | "downvote",
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to vote.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // REMOVE CURRENT VOTE
      if (userVote === voteType) {
        await supabase
          .from("story_reactions")
          .delete()
          .eq("story_id", story.id)
          .eq("user_id", user.id)

        if (voteType === "upvote") {
          const newCount = Math.max(0, upvoteCount - 1)

          setUpvoteCount(newCount)

          await supabase
            .from("stories")
            .update({ upvotes: newCount })
            .eq("id", story.id)
        }

        if (voteType === "downvote") {
          const newCount = Math.max(0, downvoteCount - 1)

          setDownvoteCount(newCount)

          await supabase
            .from("stories")
            .update({ downvotes: newCount })
            .eq("id", story.id)
        }

        setUserVote(null)
        return
      }

      // SWITCH VOTE
      if (userVote === "upvote") {
        const newCount = Math.max(0, upvoteCount - 1)

        setUpvoteCount(newCount)

        await supabase
          .from("stories")
          .update({ upvotes: newCount })
          .eq("id", story.id)
      }

      if (userVote === "downvote") {
        const newCount = Math.max(0, downvoteCount - 1)

        setDownvoteCount(newCount)

        await supabase
          .from("stories")
          .update({ downvotes: newCount })
          .eq("id", story.id)
      }

      await supabase
        .from("story_reactions")
        .upsert({
          story_id: story.id,
          user_id: user.id,
          reaction_type: voteType,
        })

      if (voteType === "upvote") {
        const newCount = upvoteCount + 1

        setUpvoteCount(newCount)

        await supabase
          .from("stories")
          .update({ upvotes: newCount })
          .eq("id", story.id)
      }

      if (voteType === "downvote") {
        const newCount = downvoteCount + 1

        setDownvoteCount(newCount)

        await supabase
          .from("stories")
          .update({ downvotes: newCount })
          .eq("id", story.id)
      }

      setUserVote(voteType)
    } catch (error) {
      console.error(error)

      toast({
        title: "Error",
        description: "Failed to update vote.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to bookmark stories.",
        variant: "destructive",
      })

      return
    }

    try {
      if (isBookmarked) {
        await supabase
          .from("story_bookmarks")
          .delete()
          .eq("story_id", story.id)
          .eq("user_id", user.id)

        setIsBookmarked(false)
      } else {
        await supabase.from("story_bookmarks").insert({
          story_id: story.id,
          user_id: user.id,
        })

        setIsBookmarked(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsShareDialogOpen(true)
  }

  const shareToPlatform = async (platform: string) => {
    const storyUrl = `${window.location.origin}/story/${story.id}`
    const storyTitle = encodeURIComponent(story.title)

    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${storyUrl}`
        break

      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${storyTitle}&url=${storyUrl}`
        break

      case "whatsapp":
        shareUrl = `https://wa.me/?text=${storyTitle}%20${storyUrl}`
        break

      case "copy":
        await navigator.clipboard.writeText(storyUrl)

        toast({
          title: "Copied",
          description: "Story link copied.",
        })

        setIsShareDialogOpen(false)
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
      setIsShareDialogOpen(false)
    }
  }

  const getInitials = () => {
    if (story.profiles?.full_name) {
      return story.profiles.full_name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }

    if (story.profiles?.username) {
      return story.profiles.username.slice(0, 2).toUpperCase()
    }

    return "U"
  }

  const getDisplayName = () => {
    return (
      story.profiles?.full_name ||
      story.profiles?.username ||
      "Anonymous"
    )
  }

  const stripHtmlTags = (html: string) => {
    const temp = document.createElement("div")
    temp.innerHTML = html

    return temp.textContent || temp.innerText || ""
  }

  const getPreviewContent = (content: string) => {
    const plain = stripHtmlTags(content)

    if (plain.length <= 220) return plain

    return `${plain.slice(0, 220)}...`
  }

  const getReadingTime = (content: string) => {
    const words = content.split(" ").length
    return Math.ceil(words / 200)
  }

  const goToStory = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement

    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("audio")
    ) {
      return
    }

    router.push(`/story/${story.id}`)
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={goToStory}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            router.push(`/story/${story.id}`)
          }
        }}
      >
        <Card className="mb-5 cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {story.organisations ? (
                  <>
                    <div className="relative shrink-0">
                      {story.organisations.logo_url ? (
                        <img
                          src={story.organisations.logo_url}
                          alt={story.organisations.trading_name}
                          className="h-10 w-10 rounded-lg border bg-white object-contain"
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
                        className="font-medium hover:text-primary truncate flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {story.organisations.trading_name}

                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4"
                        >
                          ORG
                        </Badge>
                      </Link>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>
                          {formatDistanceToNow(
                            new Date(story.created_at)
                          )}{" "}
                          ago
                        </span>

                        {story.location && (
                          <>
                            <span>•</span>

                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin className="h-3 w-3 shrink-0" />

                              <span className="truncate">
                                {story.location}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : story.is_anonymous ? (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="font-medium">Anonymous</p>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(story.created_at))} ago
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={story.profiles?.avatar_url || "/placeholder.svg"}
                      />

                      <AvatarFallback>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/profile/${story.profiles?.username}`}
                        className="font-medium hover:text-primary truncate block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getDisplayName()}
                      </Link>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(story.created_at))} ago
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="secondary"
                  className={getCategoryColor(safeCategory)}
                >
                  {safeCategory.replace(/-/g, " ")}
                </Badge>

                {story.content_warning && (
                  <Badge
                    variant="outline"
                    className={`border ${getContentWarningSeverity(
                      story.content_warning
                    ).color}`}
                  >
                    ⚠️ {story.content_warning}
                  </Badge>
                )}

                {story.organisations && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <OrganisationFollowButton
                      organisationId={story.organisations.id}
                      variant="text"
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold font-serif line-clamp-2 hover:text-primary transition-colors">
                {story.title}
              </h2>

              {(story.cover_image ||
                (story.media_urls && story.media_urls.length > 0)) && (
                <ImageGridPreview
                  images={story.media_urls || []}
                  coverImage={story.cover_image}
                />
              )}

              {isVoiceStory && story.audio_url ? (
                <div className="bg-muted rounded-lg p-3">
                  <audio
                    src={story.audio_url}
                    controls
                    className="w-full"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground font-serif leading-relaxed line-clamp-3">
                  {getPreviewContent(safeContent)}
                </p>
              )}

              {story.source_url && (
                <div className="flex items-center gap-2 bg-muted/50 px-2 py-1 rounded text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />

                  <span>Originally from:</span>

                  <a
                    href={story.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:underline truncate"
                  >
                    {new URL(story.source_url).hostname}
                  </a>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-3 gap-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{story.view_count || 0}</span>
                  </div>

                  {!isVoiceStory && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />

                      <span>
                        {getReadingTime(safeContent)} min read
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={(e) => handleVote("upvote", e)}
                    className={
                      userVote === "upvote"
                        ? "text-green-600 bg-green-50"
                        : ""
                    }
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {upvoteCount}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={(e) => handleVote("downvote", e)}
                    className={
                      userVote === "downvote"
                        ? "text-red-600 bg-red-50"
                        : ""
                    }
                  >
                    <ArrowDown className="h-4 w-4 mr-1" />
                    {downvoteCount}
                  </Button>

                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    0
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? "text-blue-500" : ""}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  <div onClick={(e) => e.stopPropagation()}>
                    <ReportStoryButton
                      storyId={story.id}
                      storyAuthorId={story.user_id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>

            <DialogDescription>
              Choose where you want to share this story.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-4">
            <Button
              variant="outline"
              onClick={() => shareToPlatform("facebook")}
            >
              Facebook
            </Button>

            <Button
              variant="outline"
              onClick={() => shareToPlatform("twitter")}
            >
              Twitter
            </Button>

            <Button
              variant="outline"
              onClick={() => shareToPlatform("whatsapp")}
            >
              WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={() => shareToPlatform("copy")}
            >
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

