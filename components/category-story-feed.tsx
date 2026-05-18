"use client"

import { useState, useEffect } from "react"
import { Search, Filter, TrendingUp, Clock, Heart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { StoryCard } from "@/components/story-card"
import { CreateStoryButton } from "@/components/create-story-button"
import { supabase } from "@/lib/supabase"

interface Story {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  view_count: number
  user_id: string
  upvotes: number
  is_anonymous: boolean
  location?: string
  cover_image?: string | null
  profiles?: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface CategoryStoryFeedProps {
  categoryDisplayName: string
  category: string
  categoryDescription?: string
}

export function CategoryStoryFeed({ categoryDisplayName, category, categoryDescription }: CategoryStoryFeedProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    fetchStories()
  }, [category, sortBy])

  const fetchStories = async () => {
    setLoading(true)

    try {
      // Fetch stories for this category
      let query = supabase.from("stories").select("*").eq("category", category).eq("is_published", true)

      // Apply sorting
      switch (sortBy) {
        case "popular":
          query = query.order("view_count", { ascending: false })
          break
        case "liked":
          query = query.order("upvotes", { ascending: false })
          break
        default:
          query = query.order("created_at", { ascending: false })
      }

      const { data: storiesData, error: storiesError } = await query.limit(50)

      if (storiesError) {
        console.error("Error fetching stories:", storiesError)
        setStories([])
        return
      }

      if (!storiesData || storiesData.length === 0) {
        setStories([])
        return
      }

      // Get unique user IDs
      const userIds = [...new Set(storiesData.map((s) => s.user_id))]

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds)

      // Create profile lookup map
      const profileMap: Record<string, any> = {}
      profiles?.forEach((profile) => {
        profileMap[profile.user_id] = profile
      })

      // Merge stories with profiles
      const storiesWithProfiles = storiesData.map((story) => ({
        ...story,
        profiles: profileMap[story.user_id] || {
          username: "anonymous",
          full_name: "Anonymous User",
          avatar_url: null,
        },
      }))

      setStories(storiesWithProfiles)
    } catch (error) {
      console.error("Error fetching stories:", error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStories = stories.filter(
    (story) =>
      searchTerm === "" ||
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{categoryDisplayName}</h1>
        <p className="text-muted-foreground">
          {categoryDescription || "Stories and experiences shared by our community"}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Most Recent
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Most Popular
              </div>
            </SelectItem>
            <SelectItem value="liked">
              <div className="flex items-center">
                <Heart className="mr-2 h-4 w-4" />
                Most Liked
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stories.length}</div>
              <div className="text-sm text-muted-foreground">Stories Shared</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stories.reduce((sum, story) => sum + (story.view_count || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {stories.reduce((sum, story) => sum + (story.upvotes || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Story Button */}
      <div className="text-center">
        <CreateStoryButton />
      </div>

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to share your story in this category!</p>
            <CreateStoryButton />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
