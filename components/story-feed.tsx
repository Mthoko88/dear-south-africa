"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { StoryCard } from "@/components/story-card"
import { supabase } from "@/lib/supabase"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const categories = [
  "All Categories",
  "Family & Relationships",
  "Career & Work",
  "Education",
  "Personal Growth",
  "Community",
  "Overcoming Challenges",
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
]

export function StoryFeed() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchStories()
  }, [selectedCategory, sortBy, searchQuery])

  const fetchStories = async () => {
    setLoading(true)

    try {
      console.log("Fetching stories...")

      // Fetch stories first
      let query = supabase.from("stories").select("*")

      // Filter by category
      if (selectedCategory !== "All Categories") {
        query = query.eq("category", selectedCategory)
      }

      // Search functionality
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      }

      // Sort
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        case "oldest":
          query = query.order("created_at", { ascending: true })
          break
        case "popular":
          query = query.order("upvotes", { ascending: false })
          break
        case "trending":
          // Simple trending: stories with high engagement in last 7 days
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          query = query.gte("created_at", sevenDaysAgo.toISOString()).order("upvotes", { ascending: false })
          break
      }

      const { data: storiesData, error: storiesError } = await query

      if (storiesError) {
        console.error("Error fetching stories:", storiesError)
        setStories([])
        setLoading(false)
        return
      }

      console.log("Stories fetched:", storiesData?.length || 0)

      if (storiesData && storiesData.length > 0) {
        // Get unique author IDs
        const authorIds = [...new Set(storiesData.map((story) => story.author_id))]
        console.log("Fetching profiles for authors:", authorIds)

        // Fetch all profiles for these authors
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", authorIds)

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError)
        }

        console.log("Profiles fetched:", profilesData?.length || 0)

        // Create a map of profiles for quick lookup
        const profilesMap = new Map()
        if (profilesData) {
          profilesData.forEach((profile) => {
            profilesMap.set(profile.id, profile)
          })
        }

        // Combine stories with their author profiles
        const storiesWithProfiles = storiesData.map((story) => ({
          ...story,
          profiles: profilesMap.get(story.author_id) || {
            username: "Unknown User",
            full_name: "Unknown User",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        }))

        console.log("Stories with profiles:", storiesWithProfiles)
        setStories(storiesWithProfiles)
      } else {
        console.log("No stories found")
        setStories([])
      }
    } catch (err) {
      console.error("Unexpected error:", err)
      setStories([])
    }

    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchStories()
  }

  const handleRefresh = () => {
    fetchStories()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Loading stories...</h2>
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Community Stories</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stories */}
      <div className="space-y-4">
        {stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || selectedCategory !== "All Categories"
                  ? "No stories match your search"
                  : "No stories yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "All Categories"
                  ? "Try adjusting your search or filters"
                  : "Be the first to share your story with the community!"}
              </p>
              {(searchQuery || selectedCategory !== "All Categories") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All Categories")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {stories.length} {stories.length === 1 ? "story" : "stories"}
            </div>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} onUpdate={fetchStories} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
