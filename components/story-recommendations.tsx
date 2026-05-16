"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StoryCard } from "@/components/story-card"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { Sparkles, TrendingUp, Heart, Users, RefreshCw } from "lucide-react"

interface RecommendedStory {
  id: string
  title: string
  content: string
  user_id: string
  author_id: string
  category: string
  content_warnings: string[]
  location: string
  upvotes: number
  view_count: number
  created_at: string
  profiles: any
  recommendation_reason: string
  similarity_score: number
}

export function StoryRecommendations() {
  const { user, profile } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedStory[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"recommended" | "trending" | "similar">("recommended")

  useEffect(() => {
    if (user) {
      fetchRecommendations()
      fetchTrending()
    }
  }, [user])

  const fetchRecommendations = async () => {
    if (!user || !profile) return

    try {
      // Get user's reading history
      const { data: viewHistory } = await supabase
        .from("story_views")
        .select("story_id")
        .eq("user_id", user.id)
        .limit(50)

      const viewedStoryIds = viewHistory?.map((v) => v.story_id) || []

      // Get stories with similar categories/challenges to user's profile
      let query = supabase
        .from("stories")
        .select("*")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (viewedStoryIds.length > 0) {
        query = query.not("id", "in", `(${viewedStoryIds.join(",")})`)
      }

      const { data: stories } = await query

      if (stories) {
        const userIds = [
  ...new Set(
    stories
      .map((story: any) => story.user_id)
      .filter(Boolean)
  ),
]

const { data: profilesData } = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    full_name,
    avatar_url
  `)
  .in("user_id", userIds)

const profilesMap = new Map()

profilesData?.forEach((profile) => {
  profilesMap.set(profile.id, profile)
})
        // Calculate recommendation scores
        const storiesWithProfiles = stories.map((story) => ({
          ...story,
          profiles: profilesMap.get(story.user_id) || null,
        }))
        
        const scoredStories = storiesWithProfiles.map((story) => {
          let score = 0
          const reasons: string[] = []

          // Category match
          if (profile.interests?.includes(story.category)) {
            score += 30
            reasons.push(`Matches your interest in ${story.category}`)
          }

          // Location proximity
          if (story.location?.includes(profile.province)) {
            score += 20
            reasons.push("From your province")
          }

          // Challenge similarity
          const storyWords = (story.title + " " + story.content).toLowerCase()
          const userChallenges = profile.challenges_faced || []
          const matchingChallenges = userChallenges.filter((challenge) => storyWords.includes(challenge.toLowerCase()))
          if (matchingChallenges.length > 0) {
            score += matchingChallenges.length * 15
            reasons.push(`Relates to your experiences with ${matchingChallenges[0]}`)
          }

          // Engagement score
          const engagementScore = story.upvotes * 2 + story.view_count * 0.1
          score += Math.min(engagementScore / 10, 20)

          // Recency bonus
          const daysOld = (Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24)
          if (daysOld < 7) score += 10

          return {
            ...story,
            recommendation_reason: reasons[0] || "Popular in community",
            similarity_score: score,
          }
        })

        // Sort by score and take top recommendations
        const topRecommendations = scoredStories.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 10)

        setRecommendations(topRecommendations)
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    }
  }

  const fetchTrending = async () => {
    try {
      // Get stories with high engagement in the last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: stories } = await supabase
        .from("stories")
        .select("*")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("upvotes", { ascending: false })
        .limit(10)

      if (stories) {
        const userIds = [
  ...new Set(
    stories
      .map((story: any) => story.user_id)
      .filter(Boolean)
  ),
]

const { data: profilesData } = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    full_name,
    avatar_url
  `)
  .in("user_id", userIds)

const profilesMap = new Map()

profilesData?.forEach((profile) => {
  profilesMap.set(profile.id, profile)
})
        const storiesWithProfiles = stories.map((story) => ({
          ...story,
          profiles: profilesMap.get(story.user_id) || null,
        }))
        
        setTrending(storiesWithProfiles)
      }
    } catch (error) {
      console.error("Error fetching trending stories:", error)
    }

    setLoading(false)
  }

  const recordStoryView = async (storyId: string) => {
    if (!user) return

    try {
      await supabase.from("story_views").upsert({
        user_id: user.id,
        story_id: storyId,
        viewed_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error recording story view:", error)
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Discover Stories
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true)
              fetchRecommendations()
              fetchTrending()
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "recommended" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("recommended")}
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            For You
          </Button>
          <Button
            variant={activeTab === "trending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("trending")}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </Button>
          <Button
            variant={activeTab === "similar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("similar")}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            Similar
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === "recommended" && (
              <>
                {recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Complete your profile to get personalized recommendations!</p>
                  </div>
                ) : (
                  recommendations.map((story) => (
                    <div key={story.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {story.recommendation_reason}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(story.similarity_score)}% match
                        </span>
                      </div>
                      <div onClick={() => recordStoryView(story.id)}>
                        <StoryCard story={story} />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === "trending" && (
              <>
                {trending.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trending stories this week. Be the first to share!</p>
                  </div>
                ) : (
                  trending.map((story, index) => (
                    <div key={story.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="text-xs">
                          #{index + 1} Trending
                        </Badge>
                        <span className="text-xs text-muted-foreground">{story.upvotes} upvotes this week</span>
                      </div>
                      <div onClick={() => recordStoryView(story.id)}>
                        <StoryCard story={story} />
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === "similar" && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Stories from people with similar experiences coming soon!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
