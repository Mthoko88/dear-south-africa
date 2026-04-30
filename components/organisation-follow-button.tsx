"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, UserCheck, Loader2 } from "lucide-react"

interface Props {
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
}: Props) {
  const { toast } = useToast()

  const [isFollowing, setIsFollowing] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id || null
    setUserId(uid)

    const { count } = await supabase
      .from("organisation_follows")
      .select("*", { count: "exact", head: true })
      .eq("organisation_id", organisationId)

    setCount(count || 0)

    setLoading(false)
  }

  const toggleFollow = async () => {
    if (!userId) {
      toast({ title: "Login required", variant: "destructive" })
      return
    }

    setIsFollowing(!isFollowing)
    setCount((c) => (isFollowing ? c - 1 : c + 1))
  }

  if (loading) {
    return <Loader2 className="animate-spin h-4 w-4" />
  }

  if (variant === "text") {
    return (
      <span className={className}>
        {count} followers •{" "}
        <button onClick={toggleFollow}>
          {isFollowing ? "Following" : "Follow"}
        </button>
      </span>
    )
  }

  return (
    <Button onClick={toggleFollow} size={size} className={className}>
      {isFollowing ? <UserCheck /> : <UserPlus />}
      {isFollowing ? "Following" : "Follow"}
      {showCount && ` (${count})`}
    </Button>
  )
}
