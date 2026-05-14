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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { ReportStoryButton } from "@/components/report-story-button"
import { ImageGridPreview } from "@/components/image-grid-preview"
import { OrganisationFollowButton } from "@/components/organisation-follow-button"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface StoryCardProps {
  story: any
}

export function StoryCard({ story }: StoryCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)

  const [upvoteCount, setUpvoteCount] = useState(
    Number(story?.upvotes || 0)
  )

  const [downvoteCount, setDownvoteCount] = useState(
    Number(story?.downvotes || 0)
  )

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const safeContent = story?.content || ""
  const safeCategory = story?.category || "other"

  const isVoiceStory = story?.story_type === "voice"

  useEffect(() => {
    if (!user || !story?.id) return

    checkUserReactions()
  }, [user, story?.id])

  async function checkUserReactions() {
    try {
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
      console.error("Reaction error:", error)
    }
  }

  function stripHtmlTags(html: string) {
    return html.replace(/<[^>]*>/g, "")
  }

  function getPreviewContent(content: string) {
    const plain = stripHtmlTags(content)

    if (plain.length <= 220) return plain

    return plain.slice(0, 220) + "..."
  }

  function getReadingTime(content: string) {
    const words = content.split(" ").length
    return Math.max(1, Math.ceil(words / 200))
  }

  function getInitials() {
    if (story?.profiles?.full_name) {
      return story.profiles.full_name
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }

    if (story?.profiles?.username) {
      return story.profiles.username.slice(0, 2).toUpperCase()
    }

    return "U"
  }

  function getDisplayName() {
    return (
      story?.profiles?.full_name ||
      story?.profiles?.username ||
      "Anonymous"
    )
  }

  async function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in first.",
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

  function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    setIsShareDialogOpen(true)
  }

  function goToStory() {
    router.push(`/story/${story.id}`)
  }

  return (
    <>
      <Card
        className="mb-5 cursor-pointer hover:shadow-md transition-shadow"
        onClick={goToStory}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={story?.profiles?.avatar_url || ""}
              />

              <AvatarFallback>
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {getDisplayName()}
              </p>

              <p className="text-xs text-muted-foreground">
                {story?.created_at
                  ? formatDistanceToNow(
                      new Date(story.created_at)
                    ) + " ago"
                  : ""}
              </p>
            </div>

            <Badge variant="secondary">
              {safeCategory}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold line-clamp-2">
            {story?.title || "Untitled Story"}
          </h2>

          {story?.cover_image && (
            <ImageGridPreview
              images={story?.media_urls || []}
              coverImage={story.cover_image}
            />
          )}

          {isVoiceStory && story?.audio_url ? (
            <audio
              controls
              className="w-full"
              src={story.audio_url}
            />
          ) : (
            <p className="text-muted-foreground line-clamp-3">
              {getPreviewContent(safeContent)}
            </p>
          )}

          {story?.source_url && (
            <a
              href={
                story.source_url.startsWith("http")
                  ? story.source_url
                  : `https://${story.source_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
              External Source
            </a>
          )}

          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{story?.view_count || 0}</span>
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
              <Button variant="ghost" size="sm">
                <ArrowUp className="h-4 w-4 mr-1" />
                {upvoteCount}
              </Button>

              <Button variant="ghost" size="sm">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>

            <DialogDescription>
              Share this story with others.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/story/${story.id}`
                )

                toast({
                  title: "Copied",
                  description: "Link copied successfully.",
                })

                setIsShareDialogOpen(false)
              }}
            >
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
