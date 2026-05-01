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
  "Mental Health",
  "Relationships",
  "Career",
  "Education",
  "Personal Growth",
  "Family",
  "Community",
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
      let query = supabase.from("stories").select("*").eq("is_published", true)

      // Filter by category
      if (selectedCategory !== "All Categories") {
        const categorySlug = selectedCategory.toLowerCase().replace(/\s+/g, "-")
        query = query.eq("category", categorySlug)
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
          query = query.order("view_count", { ascending: false })
          break
      }

      const { data: storiesData, error: storiesError } = await query.limit(30)

      if (storiesError || !storiesData) {
        console.error("Error fetching stories:", storiesError)
        setStories([])
        return
      }

      if (storiesData.length === 0) {
        setStories([])
        return
      }

      const userIds = [...new Set(storiesData.map((s) => s.user_id))]
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .in("user_id", userIds)

      const profilesMap = new Map<string, any>()
      profilesData?.forEach((p) => profilesMap.set(p.user_id, p))

      const storiesWithProfiles = storiesData.map((story) => ({
        ...story,
        profiles: profilesMap.get(story.user_id) ?? {
          username: "anonymous",
          full_name: "Anonymous User",
          avatar_url: null,
        },
      }))

      setStories(storiesWithProfiles)
    } catch (err) {
      console.error("Error fetching stories:", err)
      setStories([])
    } finally {
      setLoading(false)
    }
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
    <div>
    </div>
  )
}
