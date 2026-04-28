"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface StoryReactionsProps {
  storyId: string
  initialLikes: number
  className?: string
}

interface ReactionCounts {
  likes: number
  bookmarks: number
  comments: number
}

export function StoryReactions({ storyId, initialLikes, className }: StoryReactionsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [counts, setCounts] = useState<ReactionCounts>({
    likes: initialLikes,
    bookmarks: 0,
    comments: 0,
  })
  const [userReactions, setUserReactions] = useState({
    hasLiked: false,
    hasBookmarked: false,
  })
  const [loading, setLoading] = useState(false)
  // Track how many times each emotional reaction has been used
  const [emotionalCounts, setEmotionalCounts] = useState<Record<string, number>>({})
  // Track which emotional reactions the current signed-in user has given
  const [userEmotionalReactions, setUserEmotionalReactions] = useState<string[]>([])

  // Emotional reactions for showing support
  const emotionalReactions = [
    { type: "strength", emoji: "💪", label: "Strength" },
    { type: "support", emoji: "🤗", label: "Support" },
    { type: "courage", emoji: "🦁", label: "Courage" },
    { type: "hope", emoji: "🌟", label: "Hope" },
    { type: "healing", emoji: "🌱", label: "Healing" },
    { type: "love", emoji: "❤️", label: "Love" },
    { type: "grateful", emoji: "🙏", label: "Grateful" },
    { type: "inspiring", emoji: "✨", label: "Inspiring" },
  ]

  useEffect(() => {
    fetchReactionData()
  }, [storyId, user])

  const fetchReactionData = async () => {
    try {
      console.log("Fetching reaction data for story:", storyId)

      // Get story upvotes from the stories table
      const { data: storyData } = await supabase.from("stories").select("upvotes").eq("id", storyId).single()

      // Try to get comments count
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("story_id", storyId)

      setCounts({
        likes: storyData?.upvotes || initialLikes,
        bookmarks: 0, // We'll implement this later
        comments: commentsCount || 0,
      })

      // Check user reactions if logged in
      if (user) {
        // For now we’ll start with empty emotional-reaction data.
        // (Hook this up to Supabase later by counting comments or story_reactions.)
        setEmotionalCounts({})
        setUserEmotionalReactions([])
      }

      console.log("Reaction data loaded successfully")
    } catch (error) {
      console.error("Error fetching reaction data:", error)
      // Don't show error to user, just use default values
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // For now, just increment the upvotes in the stories table
      const newLikeCount = userReactions.hasLiked ? counts.likes - 1 : counts.likes + 1

      const { error } = await supabase
        .from("stories")
        .update({ upvotes: Math.max(0, newLikeCount) })
        .eq("id", storyId)

      if (error) throw error

      setUserReactions((prev) => ({ ...prev, hasLiked: !prev.hasLiked }))
      setCounts((prev) => ({ ...prev, likes: newLikeCount }))

      toast({
        title: userReactions.hasLiked ? "Like removed" : "Story liked!",
        description: userReactions.hasLiked ? "You unliked this story." : "You liked this story.",
      })
    } catch (error: any) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark stories.",
        variant: "destructive",
      })
      return
    }

    // For now, just show a message that bookmarks will be implemented
    toast({
      title: "Coming soon",
      description: "Bookmarks feature will be available soon!",
    })
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Dear South Africa Story",
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Story link copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Don't show error for cancelled shares
      if (error instanceof Error && error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share story.",
          variant: "destructive",
        })
      }
    }
  }

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments-section")
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant={userReactions.hasLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={
              userReactions.hasLiked
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            }
          >
            <Heart className={`h-4 w-4 mr-2 ${userReactions.hasLiked ? "fill-current" : ""}`} />
            {counts.likes} {counts.likes === 1 ? "Like" : "Likes"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollToComments}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 bg-transparent"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comments
          </Button>

          <Button
            variant={userReactions.hasBookmarked ? "default" : "outline"}
            size="sm"
            onClick={handleBookmark}
            disabled={loading}
            className={
              userReactions.hasBookmarked
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            }
          >
            <Bookmark className={`h-4 w-4 mr-2 ${userReactions.hasBookmarked ? "fill-current" : ""}`} />
            {userReactions.hasBookmarked ? "Saved" : "Save"}
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="hover:bg-green-50 hover:text-green-600 hover:border-green-200 bg-transparent"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Emotional support reactions */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-muted-foreground">Show your support to the story sharer:</div>
        <div className="flex flex-wrap gap-2">
          {emotionalReactions.map((reaction) => {
            const count = emotionalCounts[reaction.type] || 0
            const hasReacted = userEmotionalReactions.includes(reaction.type)

            return (
              <Button
                key={reaction.type}
                variant={hasReacted ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (loading) return
                  // Toggle the user's reaction optimistically
                  setUserEmotionalReactions((prev) =>
                    prev.includes(reaction.type) ? prev.filter((t) => t !== reaction.type) : [...prev, reaction.type],
                  )
                  // Update the visible counts optimistically
                  setEmotionalCounts((prev) => ({
                    ...prev,
                    [reaction.type]: (prev[reaction.type] || 0) + (hasReacted ? -1 : 1),
                  }))
                }}
                disabled={loading}
                className={`h-9 px-3 transition-all ${
                  hasReacted
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                }`}
              >
                <span className="mr-2 text-base">{reaction.emoji}</span>
                <span className="text-sm">{reaction.label}</span>
                {count > 0 && <span className="ml-2 text-xs bg-background/20 px-1.5 py-0.5 rounded-full">{count}</span>}
              </Button>
            )
          })}
        </div>

        {/* Show reaction summary if there are reactions */}
        {Object.values(emotionalCounts).some((count) => count > 0) && (
          <div className="text-sm text-muted-foreground">
            {Object.entries(emotionalCounts)
              .filter(([_, count]) => count > 0)
              .map(([type, count]) => {
                const reaction = emotionalReactions.find((r) => r.type === type)
                return reaction ? `${reaction.emoji} ${count}` : null
              })
              .filter(Boolean)
              .join(" • ")}
          </div>
        )}
      </div>
    </div>
  )
}
