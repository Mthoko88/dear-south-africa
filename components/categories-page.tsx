"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Heart,
  Users,
  BookOpen,
  Lightbulb,
  Home,
  TrendingUp,
  Brain,
  Briefcase,
  Palette,
  Sparkles,
  Plus,
  Search,
  ArrowLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/header"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  story_count: number
  created_at?: string
}

const getFallbackCategories = () => [
  {
    id: "1",
    name: "Family & Relationships",
    slug: "family-relationships",
    description: "Stories about family bonds, relationships, love, marriage, parenting, and connections with others.",
    icon: "Heart",
    story_count: 234,
  },
  {
    id: "2",
    name: "Career & Work",
    slug: "career-work",
    description:
      "Professional journeys, workplace experiences, career changes, entrepreneurship, and work-life balance.",
    icon: "Users",
    story_count: 189,
  },
  {
    id: "3",
    name: "Education",
    slug: "education",
    description: "Learning experiences, school memories, academic achievements, and educational challenges.",
    icon: "BookOpen",
    story_count: 156,
  },
  {
    id: "4",
    name: "Personal Growth",
    slug: "personal-growth",
    description: "Self-improvement journeys, life lessons, spiritual growth, and personal development stories.",
    icon: "Lightbulb",
    story_count: 203,
  },
  {
    id: "5",
    name: "Community",
    slug: "community",
    description: "Stories about neighborhoods, local events, community service, and making a difference.",
    icon: "Home",
    story_count: 167,
  },
  {
    id: "6",
    name: "Overcoming Challenges",
    slug: "overcoming-challenges",
    description: "Stories of resilience, overcoming obstacles, healing, recovery, and triumph over adversity.",
    icon: "TrendingUp",
    story_count: 298,
  },
  {
    id: "7",
    name: "Mental Health",
    slug: "mental-health",
    description: "Mental health journeys, therapy experiences, depression, anxiety, and emotional wellness.",
    icon: "Brain",
    story_count: 142,
  },
  {
    id: "8",
    name: "Entrepreneurship",
    slug: "entrepreneurship",
    description: "Business stories, startup journeys, failures, successes, and entrepreneurial experiences.",
    icon: "Briefcase",
    story_count: 98,
  },
  {
    id: "9",
    name: "Arts & Culture",
    slug: "arts-culture",
    description: "Creative expressions, cultural experiences, art, music, literature, and cultural heritage.",
    icon: "Palette",
    story_count: 76,
  },
]

const iconMap = {
  Heart,
  Users,
  BookOpen,
  Lightbulb,
  Home,
  TrendingUp,
  Brain,
  Briefcase,
  Palette,
  Sparkles,
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestionOpen, setSuggestionOpen] = useState(false)
  const [suggestionForm, setSuggestionForm] = useState({
    name: "",
    description: "",
    reason: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    if (!supabase || typeof supabase.from !== "function") {
      setCategories(getFallbackCategories())
      setLoading(false)
      return
    }

    try {
      const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*")

      if (categoriesError) {
        console.error("[v0] Error loading categories:", categoriesError)
        if (categoriesError.code === "42P01") {
          setCategories(getFallbackCategories())
        } else {
          throw categoriesError
        }
        setLoading(false)
        return
      }

      // Count stories for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count, error: countError } = await supabase
            .from("stories")
            .select("*", { count: "exact", head: true })
            .eq("category", category.slug)
            .eq("is_published", true)

          if (countError) {
            console.error(`[v0] Error counting stories for ${category.slug}:`, countError)
            return { ...category, story_count: 0 }
          }

          return { ...category, story_count: count || 0 }
        }),
      )

      // Sort by story count descending
      categoriesWithCounts.sort((a, b) => b.story_count - a.story_count)
      setCategories(categoriesWithCounts)
    } catch (err) {
      console.error("[v0] Failed to load categories:", err)
      toast({
        title: "Error loading categories",
        description: "Could not load categories from database. Please refresh the page.",
        variant: "destructive",
      })
      setCategories(getFallbackCategories())
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`)
  }

  const handleBackClick = () => {
    router.push("/")
  }

  const getIcon = (iconName?: string) => {
    if (!iconName || !iconMap[iconName as keyof typeof iconMap]) {
      return Sparkles
    }
    return iconMap[iconName as keyof typeof iconMap]
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/categories/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: suggestionForm.name,
          description: suggestionForm.description,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create category")
      }

      toast({
        title: "Category Created!",
        description: "Your new category has been added and is now visible to everyone.",
      })

      setSuggestionForm({ name: "", description: "", reason: "" })
      setSuggestionOpen(false)

      await loadCategories()
    } catch (error) {
      console.error("[v0] Category suggestion error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit suggestion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Title */}
        <div className="mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Story Categories</h1>
            <p className="text-muted-foreground">Browse all categories or suggest a new one for the community</p>
          </div>

          <Dialog open={suggestionOpen} onOpenChange={setSuggestionOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Suggest Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSuggestionSubmit}>
                <DialogHeader>
                  <DialogTitle>Suggest a New Category</DialogTitle>
                  <DialogDescription>
                    Help us improve the platform by suggesting a category you'd like to see more stories about.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      placeholder="e.g., Travel & Adventure"
                      value={suggestionForm.name}
                      onChange={(e) => setSuggestionForm((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      placeholder="Briefly describe what stories would fit in this category..."
                      value={suggestionForm.description}
                      onChange={(e) => setSuggestionForm((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="suggestion-reason">Why is this category needed?</Label>
                    <Textarea
                      id="suggestion-reason"
                      placeholder="Tell us why you think this category would be valuable for the community..."
                      value={suggestionForm.reason}
                      onChange={(e) => setSuggestionForm((prev) => ({ ...prev, reason: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSuggestionOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Suggestion"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* All Categories */}
          {filteredCategories.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => {
                  const Icon = getIcon(category.icon)
                  return (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </div>
                          <Badge variant="secondary">{category.story_count}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {category.description || "Explore stories in this category"}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredCategories.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                No categories match your search. Try a different term or suggest a new category.
              </p>
              <Button onClick={() => setSuggestionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Suggest New Category
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Total Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{categories.reduce((sum, cat) => sum + cat.story_count, 0)}</div>
            <div className="text-sm text-muted-foreground">Total Stories</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
