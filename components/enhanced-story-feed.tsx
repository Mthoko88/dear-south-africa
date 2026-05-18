"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { StoryCard } from "@/components/story-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, RefreshCw, Search } from "lucide-react"

interface Story {
  id: string
  title: string
  content: string | null // Allow null for voice stories
  user_id: string
  category: string
  content_warning: string | null // Added content_warning
  location: string | null
  upvotes: number
  downvotes: number // Added downvotes
  view_count: number
  created_at: string
  story_type?: string // Added story_type field
  audio_url?: string | null // Added audio_url field
  is_anonymous?: boolean // Added is_anonymous field
  cover_image?: string | null // Added cover_image field
  media_urls?: string[] | null // Added media_urls field
  organisation_id?: string | null // Added organisation_id field
  source_url?: string | null // Added source_url for imported articles
  profiles?: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  organisations?: {
    id: string
    trading_name: string
    logo_url: string | null
    organisation_type: string
    is_verified: boolean
  } | null
}

export function EnhancedStoryFeed() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStories()
  }, [])

  async function fetchStories() {
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        throw new Error("Supabase client is not initialized")
      }

      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select(
          `id, title, content, user_id, category, content_warning, location, upvotes, downvotes, view_count, created_at, story_type, audio_url, is_anonymous, cover_image, media_urls, organisation_id, source_url,
          organisations:organisation_id (id, trading_name, logo_url, organisation_type, is_verified)`,
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(30)

      if (storiesError) {
        console.error("Error fetching stories:", storiesError)
        setError("Unable to load stories. Please check your connection and try again.")
        setStories([])
        return
      }

      if (!storiesData || storiesData.length === 0) {
        setStories([])
        return
      }

      const userIds = [...new Set(storiesData.map((s) => s.user_id))]

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
      }

      const profileMap: Record<string, any> = {}
      profiles?.forEach((profile) => {
        profileMap[profile.user_id] = profile
      })

      const storiesWithProfiles = storiesData.map((story: any) => ({
        ...story,
        profiles: profileMap[story.user_id] || {
          username: "anonymous",
          full_name: "Anonymous User",
          avatar_url: null,
        },
        organisations: story.organisations || null,
      }))

      setStories(storiesWithProfiles)
    } catch (error) {
      console.error("Error fetching stories:", error)
      setError("Unable to load stories. Please refresh the page and try again.")
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStories = stories.filter(
    (story) =>
      searchQuery === "" ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.content && story.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchStories} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Community Stories</h2>
          <p className="text-muted-foreground">Discover and connect through shared experiences</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchStories} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No stories found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
