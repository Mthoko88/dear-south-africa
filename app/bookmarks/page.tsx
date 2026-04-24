"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookmarkIcon, BookmarkX, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface Story {
  id: string
  title: string
  content: string
  category: string
  user_id: string // Changed from author_id to user_id to match database schema
  created_at: string
  view_count: number
  is_anonymous: boolean
  location?: string
  content_warning?: string
  upvotes?: number
  downvotes?: number
  author?: {
    username: string
    full_name: string
    avatar_url: string
  }
}

interface BookmarkData {
  id: string
  story_id: string
  created_at: string
  story: Story
}

export default function BookmarksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchBookmarks()
    }
  }, [user])

  const fetchBookmarks = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data: rawBookmarks, error: bmError } = await supabase
        .from("story_bookmarks")
        .select("id, story_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (bmError) throw bmError
      if (!rawBookmarks || rawBookmarks.length === 0) {
        setBookmarks([])
        return
      }

      // Fetch stories in bulk
      const storyIds = rawBookmarks.map((b) => b.story_id)
      const { data: stories, error: storiesError } = await supabase
        .from("stories")
        .select(
          "id, title, content, category, user_id, created_at, view_count, is_anonymous, location, content_warning, upvotes, downvotes", // Changed author_id to user_id and added upvotes/downvotes
        )
        .in("id", storyIds)

      if (storiesError) throw storiesError

      // Fetch author profiles
      const authorIds = [...new Set(stories.map((s) => s.user_id))] // Changed author_id to user_id
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", authorIds)

      if (profilesError) throw profilesError
      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      // Merge everything
      const storiesMap = new Map(stories.map((s) => [s.id, { ...s, author: profilesMap.get(s.user_id) }])) // Changed author_id to user_id

      const merged: BookmarkData[] = rawBookmarks
        .map((b) => {
          const story = storiesMap.get(b.story_id)
          return story
            ? {
                id: b.id,
                story_id: b.story_id,
                created_at: b.created_at,
                story,
              }
            : null // ignore bookmarks whose stories were deleted
        })
        .filter(Boolean) as BookmarkData[]

      setBookmarks(merged)
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase.from("story_bookmarks").delete().eq("id", bookmarkId)

      if (error) throw error

      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId))
    } catch (error) {
      console.error("Error removing bookmark:", error)
    }
  }

  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.story.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || bookmark.story.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "story-newest":
        return new Date(b.story.created_at).getTime() - new Date(a.story.created_at).getTime()
      case "story-oldest":
        return new Date(a.story.created_at).getTime() - new Date(b.story.created_at).getTime()
      default:
        return 0
    }
  })

  const categories = [...new Set(bookmarks.map((b) => b.story.category))].sort()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view bookmarks</h2>
            <p className="text-muted-foreground">You need to be signed in to view your saved stories.</p>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Bookmarks</h1>
          <p className="text-muted-foreground">
            {bookmarks.length} saved {bookmarks.length === 1 ? "story" : "stories"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bookmarked stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest Bookmarks</SelectItem>
            <SelectItem value="oldest">Oldest Bookmarks</SelectItem>
            <SelectItem value="story-newest">Newest Stories</SelectItem>
            <SelectItem value="story-oldest">Oldest Stories</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedBookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookmarkIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              {searchTerm || categoryFilter !== "all" ? "No matching bookmarks" : "No bookmarks yet"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start bookmarking stories you want to read later"}
            </p>
            {(searchTerm || categoryFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="relative">
              <StoryCard story={bookmark.story} />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeBookmark(bookmark.id)}
                title="Remove bookmark"
              >
                <BookmarkX className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
