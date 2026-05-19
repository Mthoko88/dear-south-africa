"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"

interface OrganisationFollowButtonProps {
  organisationId: string
  variant?: "button" | "text"
  size?: "sm" | "default" | "lg"
  showCount?: boolean
  className?: string
}

export function OrganisationFollowButton({
  organisationId,
  variant = "button",
  size = "default",
  showCount = false,
  className = "",
}: OrganisationFollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    checkFollowStatus()
  }, [organisationId])

  const checkFollowStatus = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Get follower count
      const { count } = await supabase
        .from("organisation_follows")
        .select("*", { count: "exact", head: true })
        .eq("organisation_id", organisationId)

      setFollowerCount(count || 0)

      // Check if current user is following
      if (user) {
        const { data } = await supabase
          .from("organisation_follows")
          .select("id")
          .eq("organisation_id", organisationId)
          .eq("user_id", user.id)
          .maybeSingle()

        setIsFollowing(!!data)
      }
    } catch (error) {
      console.error("Error checking follow status:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow organisations.",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("organisation_follows")
          .delete()
          .eq("organisation_id", organisationId)
          .eq("user_id", currentUserId)

        if (error) throw error

        setIsFollowing(false)
        setFollowerCount((prev) => Math.max(0, prev - 1))
        toast({
          title: "Unfollowed",
          description: "You will no longer receive updates from this organisation.",
        })
      } else {
        // Follow
        const { error } = await supabase
          .from("organisation_follows")
          .insert({
            organisation_id: organisationId,
            user_id: currentUserId,
          })

        if (error) throw error

        setIsFollowing(true)
        setFollowerCount((prev) => prev + 1)
        toast({
          title: "Following!",
          description: "You will now receive updates from this organisation.",
        })
      }
    } catch (error) {
      console.error("Error toggling follow:", error)
      toast({
        title: "Error",
        description: "Could not update follow status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return variant === "text" ? (
      <span className={`text-muted-foreground ${className}`}>...</span>
    ) : (
      <Button variant="outline" size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  // Text variant - just shows follower count with clickable follow text
  if (variant === "text") {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <span className="text-muted-foreground">
          <strong className="text-foreground">{followerCount}</strong> {followerCount === 1 ? "follower" : "followers"}
        </span>
        {currentUserId && (
          <>
            <span className="text-muted-foreground">•</span>
            <button
              onClick={handleFollow}
              disabled={actionLoading}
              className={`font-medium hover:underline ${
                isFollowing ? "text-muted-foreground" : "text-primary"
              }`}
            >
              {actionLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          </>
        )}
      </div>
    )
  }

  // Button variant
  return (
    <div className={`flex items-center gap-1 rounded-full ${className}`}>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size={size}
        onClick={handleFollow}
        disabled={actionLoading}
      >
        {actionLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <UserCheck className="mr-2 h-4 w-4" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        {isFollowing ? "Following" : "Follow"}
      </Button>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </span>
      )}
    </div>
  )
}
