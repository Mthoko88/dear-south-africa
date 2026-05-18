"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Send, Reply } from "lucide-react"

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  story_id: string
  parent_id: string | null
  profiles?: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  storyId: string
  onCommentCountChange?: (count: number) => void
}

export function CommentSection({ storyId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  useEffect(() => {
    fetchComments()
  }, [storyId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data: commentsData, error } = await supabase
        .from("comments")
        .select("*")
        .eq("story_id", storyId)
        .order("created_at", { ascending: true })

      if (error) throw error

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((comment) => comment.author_id))]

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, username, full_name, avatar_url")
          .in("user_id", userIds)

        const commentsWithProfiles = commentsData.map((comment) => ({
          ...comment,
          profiles: profilesData?.find((profile) => profile.user_id === comment.author_id),
          replies: [],
        }))

        // Build nested structure
        const topLevelComments: Comment[] = []
        const commentMap = new Map<string, Comment>()

        commentsWithProfiles.forEach((comment) => {
          commentMap.set(comment.id, comment)
        })

        commentsWithProfiles.forEach((comment) => {
          if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id)
            if (parent) {
              if (!parent.replies) parent.replies = []
              parent.replies.push(comment)
            }
          } else {
            topLevelComments.push(comment)
          }
        })

        setComments(topLevelComments)
        onCommentCountChange?.(commentsData.length)
      } else {
        setComments([])
        onCommentCountChange?.(0)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments.",
        variant: "destructive",
      })
    }
    setLoading(false)
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

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please write something before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from("comments").insert({
        story_id: storyId,
        author_id: user.id,
        content: newComment.trim(),
        parent_id: null,
      })

      if (error) throw error

      setNewComment("")
      await fetchComments()

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    }
    setSubmitting(false)
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to reply.",
        variant: "destructive",
      })
      return
    }

    if (!replyContent.trim()) {
      toast({
        title: "Empty reply",
        description: "Please write something before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("comments").insert({
        story_id: storyId,
        author_id: user.id,
        content: replyContent.trim(),
        parent_id: parentId,
      })

      if (error) throw error

      setReplyContent("")
      setReplyingTo(null)
      await fetchComments()

      toast({
        title: "Reply added",
        description: "Your reply has been posted successfully.",
      })
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    }
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

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <div className={`flex space-x-3 ${depth > 0 ? "ml-8 mt-4 border-l-2 border-muted pl-4" : ""}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url || "/placeholder.svg"} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">{getInitials(comment.profiles)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="font-medium text-sm">{getDisplayName(comment.profiles)}</span>
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</div>
        {user && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
            onClick={() => setReplyingTo(comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                <Send className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Render nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4 mt-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div data-comments-section className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts or support..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={submitting}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting || !newComment.trim()} size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Join the conversation</p>
              <p className="text-sm">Sign in to share your thoughts and support.</p>
            </div>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No comments yet</p>
              <p className="text-sm">Be the first to share your thoughts or support.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
