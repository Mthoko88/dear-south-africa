"use client"

import React from "react"
import { Suspense } from "react"
import Loading from "./loading" // Import the Loading component

import { useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { StoryCard } from "@/components/story-card"
import { BackButton } from "@/components/back-button"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, X, Loader2, BookOpen, Mic } from "lucide-react"

interface Story {
  id: string
  title: string
  content?: string
  audio_url?: string
  story_type?: string
  category?: string
  content_warning?: string
  location?: string
  upvotes?: number
  downvotes?: number
  view_count?: number
  created_at: string
  user_id: string
  is_anonymous?: boolean
  profiles?: {
    username: string
    full_name?: string
    avatar_url?: string
  }
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "mental-health", label: "Mental Health" },
  { value: "relationships", label: "Relationships" },
  { value: "career", label: "Career" },
  { value: "family", label: "Family" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "personal-growth", label: "Personal Growth" },
  { value: "social-issues", label: "Social Issues" },
  { value: "spirituality", label: "Spirituality" },
  { value: "other", label: "Other" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "most-upvoted", label: "Most Upvoted" },
]

const STORY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "written", label: "Written Stories" },
  { value: "voice", label: "Voice Stories" },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const initialQuery = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || "all"
  const initialSort = searchParams.get("sort") || "newest"
  const initialType = searchParams.get("type") || "all"

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sortBy, setSortBy] = useState(initialSort)
  const [storyType, setStoryType] = useState(initialType)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = useCallback(async () => {
    setLoading(true)
    setHasSearched(true)

    try {
      let query = supabase
        .from("stories")
        .select("*")
        .eq("is_published", true)

      // Search in title, content, category, and content_warning
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,content_warning.ilike.%${searchQuery}%`)
      }

      // Filter by category
      if (category && category !== "all") {
        query = query.eq("category", category)
      }

      // Filter by story type
      if (storyType === "written") {
        query = query.is("audio_url", null)
      } else if (storyType === "voice") {
        query = query.not("audio_url", "is", null)
      }

      // Sorting
      switch (sortBy) {
        case "oldest":
          query = query.order("created_at", { ascending: true })
          break
        case "most-viewed":
          query = query.order("view_count", { ascending: false, nullsFirst: false })
          break
        case "most-upvoted":
          query = query.order("upvotes", { ascending: false, nullsFirst: false })
          break
        case "newest":
        default:
          query = query.order("created_at", { ascending: false })
      }

      // Limit results
      query = query.limit(50)

      const { data, error } = await query

      if (error) {
        console.error("Search error:", error)
        setStories([])
      } else if (data && data.length > 0) {
        // Fetch profiles for all stories
        const userIds = [...new Set(data.map((s) => s.user_id).filter(Boolean))]
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, username, full_name, avatar_url")
            .in("user_id", userIds)
          
          // Map profiles to stories
          const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || [])
          const storiesWithProfiles = data.map((story) => ({
            ...story,
            profiles: profileMap.get(story.user_id) || null,
          }))
          
          setStories(storiesWithProfiles)
        } else {
          setStories(data)
        }
      } else {
        setStories([])
      }
    } catch (error) {
      console.error("Search error:", error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, category, sortBy, storyType])

  // Update URL with search params
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category !== "all") params.set("category", category)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (storyType !== "all") params.set("type", storyType)
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : "/search"
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, category, sortBy, storyType, router])

  // Search on initial load if there's a query
  useEffect(() => {
    if (initialQuery) {
      performSearch()
    }
  }, []) // Only run on mount

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrl()
    performSearch()
  }

  // Handle filter changes
  const handleFilterChange = () => {
    updateUrl()
    performSearch()
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setCategory("all")
    setSortBy("newest")
    setStoryType("all")
    router.replace("/search", { scroll: false })
    setStories([])
    setHasSearched(false)
  }

  const activeFiltersCount = [
    category !== "all",
    sortBy !== "newest",
    storyType !== "all",
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <BackButton />

            {/* Search Header */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">Search Stories</h1>
              <p className="text-muted-foreground">
                Find stories by keywords, categories, or topics
              </p>
            </div>

            {/* Search Form */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, content, category, or content warning..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </form>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>

                  {(searchQuery || activeFiltersCount > 0) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={category}
                        onValueChange={(value) => {
                          setCategory(value)
                          setTimeout(handleFilterChange, 0)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Story Type</label>
                      <Select
                        value={storyType}
                        onValueChange={(value) => {
                          setStoryType(value)
                          setTimeout(handleFilterChange, 0)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {STORY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.value === "written" && <BookOpen className="h-4 w-4" />}
                                {type.value === "voice" && <Mic className="h-4 w-4" />}
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => {
                          setSortBy(value)
                          setTimeout(handleFilterChange, 0)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Filters Display */}
            {(searchQuery || activeFiltersCount > 0) && hasSearched && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setTimeout(handleFilterChange, 0)
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {category !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {CATEGORIES.find((c) => c.value === category)?.label}
                    <button
                      onClick={() => {
                        setCategory("all")
                        setTimeout(handleFilterChange, 0)
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {storyType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {STORY_TYPES.find((t) => t.value === storyType)?.label}
                    <button
                      onClick={() => {
                        setStoryType("all")
                        setTimeout(handleFilterChange, 0)
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hasSearched ? (
              <div className="space-y-4">
                {/* Results Count */}
                <p className="text-sm text-muted-foreground">
                  {stories.length === 0
                    ? "No stories found"
                    : `Found ${stories.length} ${stories.length === 1 ? "story" : "stories"}`}
                </p>

                {/* Story List */}
                {stories.length > 0 ? (
                  <div className="space-y-4">
                    {stories.map((story) => (
                      <StoryCard key={story.id} story={story} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No stories found</h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search terms or filters
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Search for stories</h3>
                  <p className="text-muted-foreground">
                    Enter keywords to find stories that resonate with you
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// Wrap the SearchPage component in a Suspense boundary
export const SearchPageWrapper = () => (
  <Suspense fallback={<Loading />}>
    <SearchPage />
  </Suspense>
)
