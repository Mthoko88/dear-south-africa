"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUp, ArrowDown, Reply } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface CommentSectionProps {
  storyId: string
  onCommentCountChange?: (count: number) => void
}

export function CommentSection({ storyId, onCommentCountChange }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()
  }, [storyId])

  const fetchComments = async () => {
    try {
      // Get comments first
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true })

      if (commentsError) {
        console.error("Error fetching comments:", commentsError)
        return
      }

      if (commentsData && commentsData.length > 0) {
        // Get unique author IDs
        const authorIds = [...new Set(commentsData.map((comment) => comment.author_id))]

        // Fetch all profiles for these authors
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", authorIds)

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError)
        }

        // Create a map of profiles for quick lookup
        const profilesMap = new Map()
        if (profilesData) {
          profilesData.forEach((profile) => {
            profilesMap.set(profile.id, profile)
          })
        }

        // Combine comments with their author profiles
        const commentsWithProfiles = commentsData.map((comment) => ({
          ...comment,
          profiles: profilesMap.get(comment.author_id) || {
            username: "Unknown User",
            full_name: "Unknown User",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        }))

        // Organize comments into threads
        const commentMap = new Map()
        const rootComments: any[] = []

        commentsWithProfiles.forEach((comment) => {
          comment.replies = []
          commentMap.set(comment.id, comment)
        })

        commentsWithProfiles.forEach((comment) => {
          if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id)
            if (parent) {
              parent.replies.push(comment)
            }
          } else {
            rootComments.push(comment)
          }
        })

        setComments(rootComments)

        // Notify parent component of comment count change
        const totalComments = commentsWithProfiles.length
        onCommentCountChange?.(totalComments)
      } else {
        setComments([])
        onCommentCountChange?.(0)
      }
    } catch (err) {
      console.error("Unexpected error fetching comments:", err)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to comment.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setLoading(true)

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      author_id: user.id,
      content: newComment,
      parent_id: null,
    })

    if (error) {
      toast({
        title: "Error posting comment",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setNewComment("")
      fetchComments()
      toast({ title: "Comment posted!" })
    }

    setLoading(false)
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    setLoading(true)

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      author_id: user.id,
      content: replyContent,
      parent_id: parentId,
    })

    if (error) {
      toast({
        title: "Error posting reply",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReplyContent("")
      setReplyTo(null)
      fetchComments()
      toast({ title: "Reply posted!" })
    }

    setLoading(false)
  }

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <Card className={`${isReply ? "ml-8 mt-2" : "mb-4"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {comment.profiles?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{comment.profiles?.full_name || comment.profiles?.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-2">{comment.content}</p>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span className="text-xs">{comment.upvotes || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2">
            <ArrowDown className="h-3 w-3" />
          </Button>
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
        </div>

        {replyTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={loading || !replyContent.trim()}
              >
                {loading ? "Posting..." : "Post Reply"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {comment.replies?.map((reply: any) => (
          <CommentItem key={reply.id} comment={reply} isReply={true} />
        ))}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Comments ({comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)})
        </h2>

        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Share your thoughts on this story..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={loading || !newComment.trim()}>
              {loading ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">Please sign in to comment.</div>
        )}
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  )
}
