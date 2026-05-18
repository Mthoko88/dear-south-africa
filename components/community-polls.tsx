"use client"

/**
 * CommunityPolls component
 *
 * Fixes the PostgREST error:
 *   “Could not find a relationship between 'community_polls' and 'created_by'”
 *
 * Instead of relying on a PostgREST FK join, we:
 *   1. Fetch the polls without any joins.
 *   2. Collect the unique `created_by` UUIDs.
 *   3. Fetch the matching profiles in a second query.
 *   4. Merge the profile data on the client.
 *
 * This avoids the missing-relationship error while keeping the UI
 * and filtering logic exactly the same.
 */

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import { BarChart3, Users, Clock, CheckCircle, Eye } from "lucide-react"

interface CommunityPoll {
  id: string
  title: string
  description: string | null
  poll_type: "single_choice" | "multiple_choice"
  options: string[]
  is_anonymous: boolean
  expires_at: string
  created_at: string
  created_by: string
  // Added at merge-time (NOT returned by DB)
  creator_profile?: { username: string | null; full_name: string | null }
  // Runtime-only helpers
  user_response?: string[] | string
  response_count: number
  results?: Record<string, number>
}

export function CommunityPolls() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [polls, setPolls] = useState<CommunityPoll[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPolls()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /** ---------------------------------------------------------------------
   * DATA FETCHING
   * ------------------------------------------------------------------- */
  const fetchPolls = async () => {
    setLoading(true)
    try {
      /* 1️⃣  Fetch polls with NO joins  */
      const { data: rawPolls, error: pollsError } = await supabase
        .from("community_polls")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (pollsError) throw pollsError
      if (!rawPolls) return setPolls([])

      /* 2️⃣  Fetch creator profiles in a second query  */
      const creatorIds = Array.from(new Set(rawPolls.map((p) => p.created_by)))

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", creatorIds)

      if (profilesError) throw profilesError

      const profileMap = new Map<string, { username: string | null; full_name: string | null }>()
      profilesData?.forEach((p) =>
        profileMap.set(p.id, {
          username: p.username,
          full_name: p.full_name,
        }),
      )

      /* 3️⃣  For each poll – get response count, user response & tally */
      const enrichedPolls: CommunityPoll[] = await Promise.all(
        rawPolls.map(async (poll) => {
          // Response count
          const { count } = await supabase
            .from("poll_responses")
            .select("*", { count: "exact", head: true })
            .eq("poll_id", poll.id)

          // This user’s response
          let userResponse: string[] | string | undefined
          if (user) {
            const { data: resp } = await supabase
              .from("poll_responses")
              .select("response")
              .eq("poll_id", poll.id)
              .eq("user_id", user.id)
              .maybeSingle()

            userResponse = resp?.response as any
          }

          // All responses for tally
          const { data: respRows } = await supabase.from("poll_responses").select("response").eq("poll_id", poll.id)

          const results: Record<string, number> = {}
          poll.options.forEach((opt) => (results[opt] = 0))
          respRows?.forEach(({ response }) => {
            if (Array.isArray(response)) {
              response.forEach((opt: string) => {
                if (opt in results) results[opt] += 1
              })
            } else if (typeof response === "string" && response in results) {
              results[response] += 1
            }
          })

          return {
            ...poll,
            creator_profile: profileMap.get(poll.created_by),
            user_response: userResponse,
            response_count: count ?? 0,
            results,
          }
        }),
      )

      setPolls(enrichedPolls)
    } catch (err) {
      console.error("Error fetching polls:", err)
      toast({
        title: "Error",
        description: "Failed to load community polls.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /** ---------------------------------------------------------------------
   * HELPERS
   * ------------------------------------------------------------------- */
  const percent = (poll: CommunityPoll, opt: string) =>
    poll.response_count === 0 ? 0 : Math.round(((poll.results?.[opt] ?? 0) / poll.response_count) * 100)

  const expired = (poll: CommunityPoll) => new Date(poll.expires_at) < new Date()

  /** ---------------------------------------------------------------------
   * SUBMIT RESPONSE
   * ------------------------------------------------------------------- */
  const submitResponse = async (poll: CommunityPoll, response: string | string[]) => {
    if (!user) {
      return toast({
        title: "Please sign in",
        description: "Sign in to participate in polls.",
        variant: "destructive",
      })
    }

    setSubmittingId(poll.id)
    try {
      const { error } = await supabase.from("poll_responses").upsert({
        poll_id: poll.id,
        user_id: user.id,
        response,
      })
      if (error) throw error
      toast({ title: "Response submitted!" })
      fetchPolls()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not submit your response.",
        variant: "destructive",
      })
    } finally {
      setSubmittingId(null)
    }
  }

  /** ---------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------- */
  if (!loading && polls.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No active polls</h3>
          <p className="text-muted-foreground">Check back later for community polls and surveys.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Polls</h2>
          <p className="text-muted-foreground">Share your voice and help shape our community</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Users className="mr-1 h-3 w-3" />
          {polls.length} active polls
        </Badge>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <SkeletonList />
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              submitting={submittingId === poll.id}
              onSubmit={submitResponse}
              expired={expired(poll)}
              percent={percent}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* -----------------------------------------------------------------------
 * Poll Card
 * --------------------------------------------------------------------- */
interface PollCardProps {
  poll: CommunityPoll
  submitting: boolean
  onSubmit: (poll: CommunityPoll, resp: string | string[]) => void
  expired: boolean
  percent: (poll: CommunityPoll, opt: string) => number
}

function PollCard({ poll, submitting, onSubmit, expired, percent }: PollCardProps) {
  const [showResults, setShowResults] = useState(expired || !!poll.user_response)
  const [selectedOpt, setSelectedOpt] = useState("")
  const [selectedMulti, setSelectedMulti] = useState<string[]>([])

  /* helpers */
  const toggleMulti = (opt: string) =>
    setSelectedMulti((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]))

  /* render */
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2 text-lg">{poll.title}</CardTitle>
            {poll.description && <p className="mb-3 text-sm text-muted-foreground">{poll.description}</p>}
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {poll.creator_profile && (
                <>
                  <span>By {poll.creator_profile.username || "Anonymous"}</span>
                  <span>•</span>
                </>
              )}
              <span>{poll.response_count} responses</span>
              <span>•</span>
              <Clock className="mr-1 h-3 w-3" />
              {expired ? "Expired" : `Expires ${formatDistanceToNow(new Date(poll.expires_at), { addSuffix: true })}`}
              {poll.is_anonymous && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">
                    Anonymous
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Toggle results */}
          {(poll.user_response || showResults) && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowResults((s) => !s)}>
              <Eye className="mr-1 h-3 w-3" />
              {showResults ? "Hide Results" : "Show Results"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Results ----------------------------------------------------- */}
        {(showResults || expired) && (
          <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-medium">Poll Results</h4>
              {poll.user_response && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  You voted
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {poll.options.map((opt) => {
                const isMine =
                  typeof poll.user_response === "string"
                    ? poll.user_response === opt
                    : Array.isArray(poll.user_response) && poll.user_response.includes(opt)

                return (
                  <div key={opt} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isMine ? "font-medium text-primary" : ""}>
                        {opt} {isMine && "✓"}
                      </span>
                      <span className="text-muted-foreground">
                        {poll.results?.[opt] ?? 0} ({percent(poll, opt)}%)
                      </span>
                    </div>
                    <Progress value={percent(poll, opt)} className="h-2" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Voting UI --------------------------------------------------- */}
        {!showResults && !expired && (
          <div className="space-y-4">
            {poll.poll_type === "multiple_choice" ? (
              <>
                <Label className="font-medium">Select all that apply:</Label>
                {poll.options.map((opt) => (
                  <div key={opt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${poll.id}-${opt}`}
                      checked={selectedMulti.includes(opt)}
                      onCheckedChange={() => toggleMulti(opt)}
                    />
                    <Label htmlFor={`${poll.id}-${opt}`}>{opt}</Label>
                  </div>
                ))}
                <Button
                  className="mt-4 w-full"
                  onClick={() => onSubmit(poll, selectedMulti)}
                  disabled={submitting || selectedMulti.length === 0}
                >
                  {submitting ? "Submitting…" : "Submit Response"}
                </Button>
              </>
            ) : (
              <>
                <Label className="font-medium">Select one option:</Label>
                <RadioGroup value={selectedOpt} onValueChange={setSelectedOpt}>
                  {poll.options.map((opt) => (
                    <div key={opt} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt} id={`${poll.id}-${opt}`} />
                      <Label htmlFor={`${poll.id}-${opt}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  className="mt-4 w-full"
                  onClick={() => onSubmit(poll, selectedOpt)}
                  disabled={submitting || !selectedOpt}
                >
                  {submitting ? "Submitting…" : "Submit Response"}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* -----------------------------------------------------------------------
 * Loading skeleton
 * --------------------------------------------------------------------- */
function SkeletonList() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 h-6 w-3/4 rounded bg-gray-200" />
              <div className="mb-2 h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
