"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import {
  BookOpen,
  Users,
  Heart,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  ArrowRight,
  PenTool,
  Edit,
  Trash2,
  MessageCircle,
  Activity,
  Bookmark,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { EditStoryModal } from "@/components/edit-story-modal"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation" // Added useRouter for navigation

interface DashboardStats {
  storiesWritten: number
  storiesRead: number
  circlesJoined: number
  connectionsMode: number
  totalReactions: number
  readingListItems: number
  achievements: any[]
  recentActivity: any[]
  diaryEntries?: number
  milestones?: number
  averageMood?: number
  commentsMade: number
  interactionsReceived: number
  bookmarksCount: number // Added bookmarks count
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const router = useRouter() // Initialize router for back button
  const [stats, setStats] = useState<DashboardStats>({
    storiesWritten: 0,
    storiesRead: 0,
    circlesJoined: 0,
    connectionsMode: 0,
    totalReactions: 0,
    readingListItems: 0,
    achievements: [],
    recentActivity: [],
    diaryEntries: 0,
    milestones: 0,
    averageMood: 0,
    commentsMade: 0,
    interactionsReceived: 0,
    bookmarksCount: 0, // Initialize bookmarks count
  })
  const [loading, setLoading] = useState(true)
  const [userStories, setUserStories] = useState<any[]>([])
  const [selectedStory, setSelectedStory] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userComments, setUserComments] = useState<any[]>([])
  const [bookmarkedStories, setBookmarkedStories] = useState<any[]>([]) // Added bookmarked stories state

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
      fetchUserStories()
      fetchUserComments()
      fetchBookmarkedStories() // Fetch bookmarked stories
    }
  }, [user])

  const fetchUserStories = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("stories")
        .select(
          "id, title, content, category, content_warning, location, upvotes, downvotes, view_count, created_at, story_type, audio_url, is_anonymous, user_id, is_published, cover_image",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error

      setUserStories(data || [])
    } catch (error) {
      console.error("Error fetching user stories:", error)
    }
  }

  const fetchUserComments = async () => {
    if (!user) return

    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id, content, created_at, story_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (commentsError) throw commentsError

      // Get story details for each comment
      const storyIds = [...new Set(commentsData?.map((c) => c.story_id) || [])]

      if (storyIds.length > 0) {
        const { data: storiesData, error: storiesError } = await supabase
          .from("stories")
          .select("id, title, user_id")
          .in("id", storyIds)

        if (storiesError) throw storiesError

        // Combine comments with story data
        const commentsWithStories =
          commentsData?.map((comment) => ({
            ...comment,
            story: storiesData?.find((s) => s.id === comment.story_id),
          })) || []

        // Filter to only show comments on other people's stories
        const commentsOnOtherStories = commentsWithStories.filter(
          (comment) => comment.story && comment.story.user_id !== user.id,
        )

        setUserComments(commentsOnOtherStories.slice(0, 5))
      } else {
        setUserComments([])
      }
    } catch (error) {
      console.error("Error fetching user comments:", error)
      setUserComments([])
    }
  }

  const fetchDashboardStats = async () => {
    if (!user) return

    console.log("[v0] Fetching dashboard stats for user:", user.id)

    try {
      console.log("[v0] Fetching stories...")
      const storiesResult = await supabase.from("stories").select("id").eq("user_id", user.id)
      console.log("[v0] Stories count:", storiesResult.data?.length)

      console.log("[v0] Fetching views...")
      const viewsResult = await supabase.from("story_views").select("id").eq("user_id", user.id)
      console.log("[v0] Views count:", viewsResult.data?.length)

      console.log("[v0] Fetching circles...")
      const circlesResult = await supabase.from("circle_members").select("id").eq("user_id", user.id)
      console.log("[v0] Circles count:", circlesResult.data?.length)

      console.log("[v0] Fetching reactions...")
      const reactionsResult = await supabase.from("story_reactions").select("id").eq("user_id", user.id)
      console.log("[v0] Reactions count:", reactionsResult.data?.length)

      console.log("[v0] Fetching reading list...")
      const readingListRes = await supabase.from("reading_lists").select("id").eq("user_id", user.id).single()
      let readingListResult = { data: [] }
      if (readingListRes.data) {
        readingListResult = await supabase
          .from("reading_list_items")
          .select("id")
          .eq("reading_list_id", readingListRes.data.id)
      }
      console.log("[v0] Reading list items:", readingListResult.data?.length)

      console.log("[v0] Fetching achievements...")
      const achievementsResult = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })
      console.log("[v0] Achievements count:", achievementsResult.data?.length)

      console.log("[v0] Fetching diary entries...")
      const diaryResult = await supabase
        .from("diary_entries")
        .select("id, mood_score, is_milestone")
        .eq("user_id", user.id)
      const diaryEntries = diaryResult.data || []
      const diaryCount = diaryEntries.length
      const milestones = diaryEntries.filter((entry) => entry.is_milestone).length
      const avgMood =
        diaryEntries.length > 0
          ? diaryEntries.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / diaryEntries.length
          : 0
      console.log("[v0] Diary entries:", diaryCount)

      console.log("[v0] Fetching comments made...")
      const commentsResult = await supabase.from("comments").select("id").eq("author_id", user.id)
      console.log("[v0] Comments made:", commentsResult.data?.length)

      console.log("[v0] Fetching interactions received...")
      const userPublishedStoriesResult = await supabase
        .from("stories")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_published", true)
      const userStoriesIds = userPublishedStoriesResult.data?.map((s) => s.id) || []
      let interactionsCount = 0

      if (userStoriesIds.length > 0) {
        const reactionsOnStoriesResult = await supabase
          .from("story_reactions")
          .select("id")
          .in("story_id", userStoriesIds)
        const commentsOnStoriesResult = await supabase.from("comments").select("id").in("story_id", userStoriesIds)

        interactionsCount = (reactionsOnStoriesResult.data?.length || 0) + (commentsOnStoriesResult.data?.length || 0)
      }
      console.log("[v0] Interactions received:", interactionsCount)

      console.log("[v0] Fetching bookmarks...")
      const bookmarksResult = await supabase.from("story_bookmarks").select("id").eq("user_id", user.id)
      console.log("[v0] Bookmarks count:", bookmarksResult.data?.length)

      const newStats = {
        storiesWritten: storiesResult.data?.length || 0,
        storiesRead: viewsResult.data?.length || 0,
        circlesJoined: circlesResult.data?.length || 0,
        connectionsMode: 0,
        totalReactions: reactionsResult.data?.length || 0,
        readingListItems: readingListResult.data?.length || 0,
        achievements: achievementsResult.data || [],
        recentActivity: [],
        diaryEntries: diaryCount,
        milestones: milestones,
        averageMood: Math.round(avgMood * 10) / 10,
        commentsMade: commentsResult.data?.length || 0,
        interactionsReceived: interactionsCount,
        bookmarksCount: bookmarksResult.data?.length || 0, // Add bookmarks count to stats
      }

      console.log("[v0] Final stats:", newStats)
      setStats(newStats)
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error)
    }

    setLoading(false)
  }

  const fetchBookmarkedStories = async () => {
    if (!user) return

    try {
      const { data: bookmarksData, error: bookmarksError } = await supabase
        .from("story_bookmarks")
        .select("id, story_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (bookmarksError) throw bookmarksError

      if (!bookmarksData || bookmarksData.length === 0) {
        setBookmarkedStories([])
        return
      }

      // Fetch story details
      const storyIds = bookmarksData.map((b) => b.story_id)
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("id, title, content, category, created_at, user_id")
        .in("id", storyIds)

      if (storiesError) throw storiesError

      // Combine bookmarks with story data
      const bookmarksWithStories = bookmarksData
        .map((bookmark) => ({
          ...bookmark,
          story: storiesData?.find((s) => s.id === bookmark.story_id),
        }))
        .filter((b) => b.story)

      setBookmarkedStories(bookmarksWithStories)
    } catch (error) {
      console.error("Error fetching bookmarked stories:", error)
      setBookmarkedStories([])
    }
  }

  const handleEditStory = (story: any) => {
    setSelectedStory(story)
    setIsEditModalOpen(true)
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("stories").delete().eq("id", storyId)

      if (error) throw error

      toast({
        title: "Story deleted",
        description: "Your story has been permanently deleted.",
      })

      fetchUserStories()
      fetchDashboardStats()
    } catch (error) {
      console.error("Error deleting story:", error)
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId)

      if (error) throw error

      toast({
        title: "Comment deleted",
        description: "Your comment has been permanently deleted.",
      })

      fetchUserComments()
      fetchDashboardStats()
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStoryUpdated = () => {
    fetchUserStories()
    fetchDashboardStats()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {profile?.full_name || profile?.username}!
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Here's what's happening in your Dear South Africa community
              </p>
            </div>
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-base sm:text-lg">
                {profile?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.storiesWritten}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Stories Written</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-red-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.totalReactions}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Reactions Given</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.commentsMade}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Comments Made</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <Activity className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.interactionsReceived}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Interactions Received</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-green-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.circlesJoined}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Circles Joined</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.storiesRead}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Stories Read</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <PenTool className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-indigo-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.diaryEntries || 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Diary Entries</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 text-center">
                <Bookmark className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-amber-600 mb-2" />
                <div className="text-xl sm:text-2xl font-bold">{stats.bookmarksCount}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Bookmarked Stories</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded h-12"></div>
                      </div>
                    ))}
                  </div>
                ) : stats.achievements.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Award className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">No achievements yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Share your first story to earn your first achievement!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.achievements.slice(0, 5).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{achievement.achievement_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <Button asChild className="w-full justify-between text-sm">
                  <Link href="/?tab=feed">
                    <span>Share a New Story</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-between bg-transparent text-sm">
                  <Link href="/connections">
                    <span>Find Connections</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-between bg-transparent text-sm">
                  <Link href="/?tab=circles">
                    <span>Join Support Circle</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-between bg-transparent text-sm">
                  <Link href="/?tab=resources">
                    <span>Find Resources</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-between bg-transparent text-sm">
                  <Link href="/profile/edit">
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-between bg-transparent text-sm">
                  <Link href="/diary">
                    <span>Write in Diary</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                    {stats.storiesWritten +
                      stats.totalReactions +
                      stats.circlesJoined +
                      stats.commentsMade +
                      stats.interactionsReceived}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Community Contributions</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Stories shared</span>
                    <span className="font-medium">{stats.storiesWritten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support given</span>
                    <span className="font-medium">{stats.totalReactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comments made</span>
                    <span className="font-medium">{stats.commentsMade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interactions received</span>
                    <span className="font-medium">{stats.interactionsReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communities joined</span>
                    <span className="font-medium">{stats.circlesJoined}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Every story shared and every reaction given helps build a stronger, more connected community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {(userStories.length > 0 || userComments.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    My Activity
                  </div>
                  <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                    <Link href={`/profile/${profile?.username}`}>View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Show user stories */}
                  {userStories.map((story) => (
                    <div
                      key={`story-${story.id}`}
                      className="flex items-start justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                    >
                      {story.cover_image && (
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden">
                          <img
                            src={story.cover_image || "/placeholder.svg"}
                            alt={`Cover for ${story.title}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            Story
                          </Badge>
                        </div>
                        <h3 className="font-medium truncate text-sm sm:text-base">{story.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {story.category?.replace(/-/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(story.created_at).toLocaleDateString()}
                          </span>
                          {!story.is_published && (
                            <Badge variant="outline" className="text-xs">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStory(story)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteStory(story.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Show user comments on other stories */}
                  {userComments.map((comment: any) => (
                    <div
                      key={`comment-${comment.id}`}
                      className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            Comment
                          </Badge>
                        </div>
                        <p className="text-sm line-clamp-2 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>On:</span>
                          <Link
                            href={`/story/${comment.story_id}`}
                            className="font-medium hover:text-primary truncate max-w-[200px]"
                          >
                            {comment.story?.title || "Untitled"}
                          </Link>
                          <span>•</span>
                          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/story/${comment.story_id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedStory && (
            <EditStoryModal
              story={selectedStory}
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedStory(null)
              }}
              onStoryUpdated={handleStoryUpdated}
            />
          )}
        </div>
      </div>
    </div>
  )
}
