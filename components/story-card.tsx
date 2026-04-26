"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  MapPin,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface StoryCardProps {
  story: any
  onUpdate?: () => void
}

export function StoryCard({ story, onUpdate }: StoryCardProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [upvotes, setUpvotes] = useState(story.upvotes || 0)
  const [downvotes, setDownvotes] = useState(story.downvotes || 0)
  const [commentCount, setCommentCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      checkUserVote()
      checkBookmark()
    }
    fetchCommentCount()
  }, [user, story.id])

  const fetchCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("story_id", story.id)

      if (!error && count !== null) {
        setCommentCount(count)
      }
    } catch (error) {
      console.error("Error fetching comment count:", error)
    }
  }

  const checkUserVote = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from("votes")
        .select("vote_type")
        .eq("user_id", user.id)
        .eq("story_id", story.id)
        .single()

      if (data) {
        setUserVote(data.vote_type)
      }
    } catch (error) {
      // No vote found, which is fine
    }
  }

  const checkBookmark = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", story.id)
        .single()

      setIsBookmarked(!!data)
    } catch (error) {
      // No bookmark found, which is fine
    }
  }

  const handleVote = async (voteType: "up" | "down") => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to vote.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Remove existing vote if same type
      if (userVote === voteType) {
        await supabase.from("votes").delete().eq("user_id", user.id).eq("story_id", story.id)

        setUserVote(null)
        if (voteType === "up") {
          setUpvotes((prev) => prev - 1)
        } else {
          setDownvotes((prev) => prev - 1)
        }
      } else {
        // Add or update vote
        await supabase.from("votes").upsert({
          user_id: user.id,
          story_id: story.id,
          vote_type: voteType,
        })

        // Update local state
        if (userVote === "up" && voteType === "down") {
          setUpvotes((prev) => prev - 1)
          setDownvotes((prev) => prev + 1)
        } else if (userVote === "down" && voteType === "up") {
          setDownvotes((prev) => prev - 1)
          setUpvotes((prev) => prev + 1)
        } else if (voteType === "up") {
          setUpvotes((prev) => prev + 1)
        } else {
          setDownvotes((prev) => prev + 1)
        }

        setUserVote(voteType)
      }

      // Update story vote counts in database
      const { data: voteData } = await supabase.from("votes").select("vote_type").eq("story_id", story.id)

      if (voteData) {
        const upvoteCount = voteData.filter((v) => v.vote_type === "up").length
        const downvoteCount = voteData.filter((v) => v.vote_type === "down").length

        await supabase
          .from("stories")
          .update({
            upvotes: upvoteCount,
            downvotes: downvoteCount,
          })
          .eq("id", story.id)
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleBookmark = async () => {
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
        await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("story_id", story.id)

        setIsBookmarked(false)
        toast({ title: "Bookmark removed" })
      } else {
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          story_id: story.id,
        })

        setIsBookmarked(true)
        toast({ title: "Story bookmarked" })
      }
    } catch (error) {
      console.error("Error bookmarking:", error)
      toast({
        title: "Error",
        description: "Failed to bookmark story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this story?")) {
      try {
        const { error } = await supabase.from("stories").delete().eq("id", story.id)

        if (!error) {
          toast({ title: "Story deleted" })
          onUpdate?.()
        } else {
          throw error
        }
      } catch (error) {
        console.error("Error deleting story:", error)
        toast({
          title: "Error",
          description: "Failed to delete story. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + "...",
          url: `${window.location.origin}/story/${story.id}`,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`)
        toast({ title: "Link copied to clipboard!" })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Helper function to get user initials
  const getUserInitials = (profile: any) => {
    if (profile?.full_name) {
      // Get initials from full name (e.g., "John Doe" -> "JD")
      return profile.full_name
        .split(" ")
        .map((name: string) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) // Limit to 2 characters
    } else if (profile?.username) {
      // Get first 2 characters of username (e.g., "john_doe" -> "JO")
      return profile.username.slice(0, 2).toUpperCase()
    }
    return "U" // Default fallback
  }

  // Helper function to get display name (prioritize username)
  const getDisplayName = (profile: any) => {
    return profile?.username || profile?.full_name || "Anonymous User"
  }

  const isAuthor = user?.id === story.author_id

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={story.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getUserInitials(story.profiles)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <Link href={`/profile/${story.profiles?.username}`} className="font-medium text-sm hover:underline">
                  {getDisplayName(story.profiles)}
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                </span>
              </div>
              {story.location && (
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{story.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {story.category}
            </Badge>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href={`/story/${story.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {story.content_warnings?.length > 0 && (
          <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs text-yellow-800">Content Warning:</span>
            <div className="flex space-x-1">
              {story.content_warnings.map((warning: string) => (
                <Badge key={warning} variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                  {warning}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Link href={`/story/${story.id}`}>
          <h3 className="font-semibold text-lg mb-3 leading-tight hover:underline cursor-pointer">{story.title}</h3>
        </Link>

        <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">{story.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("up")}
              disabled={loading}
              className={`h-8 px-2 ${userVote === "up" ? "text-orange-600 bg-orange-50" : ""}`}
            >
              <ArrowUp className="h-4 w-4 mr-1" />
              <span className="text-sm">{upvotes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("down")}
              disabled={loading}
              className={`h-8 px-2 ${userVote === "down" ? "text-blue-600 bg-blue-50" : ""}`}
            >
              <ArrowDown className="h-4 w-4" />
              <span className="text-sm">{downvotes}</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8" asChild>
              <Link href={`/story/${story.id}#comments`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">{commentCount}</span>
              </Link>
            </Button>

            {story.view_count > 0 && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{story.view_count}</span>
              </div>
            )}

            <Button variant="ghost" size="sm" className="h-8" onClick={handleBookmark}>
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-blue-600" /> : <Bookmark className="h-4 w-4" />}
            </Button>

            <Button variant="ghost" size="sm" className="h-8" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
