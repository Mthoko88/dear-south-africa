"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

import { ReportStoryButton } from "@/components/report-story-button"
import { ImageGridPreview } from "@/components/image-grid-preview"
import { OrganisationFollowButton } from "@/components/organisation-follow-button"

import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface StoryCardProps {
  story: any
}

// --- Helper functions (keep same as yours, shortened for clarity) ---

const getCategoryColor = (category?: string) => {
  const map: Record<string, string> = {
    "mental-health": "bg-purple-100 text-purple-800",
    relationships: "bg-pink-100 text-pink-800",
    career: "bg-blue-100 text-blue-800",
    family: "bg-green-100 text-green-800",
  }
  return map[category?.toLowerCase() || ""] || "bg-gray-100 text-gray-800"
}

export function StoryCard({ story }: StoryCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [upvoteCount, setUpvoteCount] = useState(story.upvotes || 0)
  const [downvoteCount, setDownvoteCount] = useState(story.downvotes || 0)
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    checkUserState()
  }, [user])

  const checkUserState = async () => {
    const { data } = await supabase
      .from("story_reactions")
      .select("reaction_type")
      .eq("story_id", story.id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (data) setUserVote(data.reaction_type)
  }

  const handleVote = async (type: "upvote" | "downvote", e: any) => {
    e.stopPropagation()

    if (!user) {
      toast({ title: "Login required", variant: "destructive" })
      return
    }

    if (userVote === type) {
      setUserVote(null)
      return
    }

    setUserVote(type)
  }

  const handleBookmark = async (e: any) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  const goToStory = () => router.push(`/story/${story.id}`)

  return (
    <>
      <Card onClick={goToStory} className="cursor-pointer mb-5">
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={story?.profiles?.avatar_url} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium">
                  {story?.profiles?.username || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(story.created_at))} ago
                </p>
              </div>
            </div>

            <Badge className={getCategoryColor(story.category)}>
              {story.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="text-xl font-semibold">{story.title}</h3>

          {story.cover_image && (
            <ImageGridPreview images={[]} coverImage={story.cover_image} />
          )}

          <p className="text-muted-foreground line-clamp-3">
            {story.content}
          </p>

          {story.source_url && (
            <a
              href={story.source_url}
              target="_blank"
              className="text-xs text-primary flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Source
            </a>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-3">
            <div className="flex gap-2">
              <Button size="sm" onClick={(e) => handleVote("upvote", e)}>
                <ArrowUp /> {upvoteCount}
              </Button>

              <Button size="sm" onClick={(e) => handleVote("downvote", e)}>
                <ArrowDown /> {downvoteCount}
              </Button>

              <Button size="sm">
                <MessageCircle /> 0
              </Button>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleBookmark}>
                <Bookmark />
              </Button>

              <Button size="sm" onClick={() => setShareOpen(true)}>
                <Share2 />
              </Button>

              <ReportStoryButton
                storyId={story.id}
                storyAuthorId={story.user_id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Story</DialogTitle>
            <DialogDescription>Select a platform</DialogDescription>
          </DialogHeader>

          <Button onClick={() => navigator.clipboard.writeText(window.location.href)}>
            Copy Link
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
} 
