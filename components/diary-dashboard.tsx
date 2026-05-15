"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase/client"
import { DiaryEntryForm } from "@/components/diary-entry-form"
import { BookOpen, Calendar, TrendingUp, Smile, MapPin, Tag, Star, Plus, Edit, Trash2, BarChart3 } from "lucide-react"
import { format, formatDistanceToNow, isValid } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DiaryEntry {
  id: string
  title: string | null
  content: string
  mood: string | null
  mood_score: number
  category: string | null
  location: string | null
  tags: string[]
  is_milestone: boolean
  entry_date: string
  created_at: string
  updated_at: string
}

interface DiaryStats {
  totalEntries: number
  currentStreak: number
  averageMoodScore: number
  mostUsedMood: string
  entriesThisMonth: number
  milestones: number
}

// Safely obtain a valid Date object for an entry.
// Falls back to created_at or "now" so date-fns never receives an Invalid Date.
function getEntryDate(entry?: DiaryEntry | null) {
  if (!entry) return new Date()

  if (entry.entry_date) {
    const d = new Date(entry.entry_date)
    if (isValid(d)) return d
  }
  if (entry.created_at) {
    const d = new Date(entry.created_at)
    if (isValid(d)) return d
  }
  return new Date()
}

export function DiaryDashboard() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [stats, setStats] = useState<DiaryStats>({
    totalEntries: 0,
    currentStreak: 0,
    averageMoodScore: 0,
    mostUsedMood: "",
    entriesThisMonth: 0,
    milestones: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDiaryData()
    }
  }, [user])

  const fetchDiaryData = async () => {
    if (!user) return

    try {
      // Fetch diary entries
      const { data: entriesData, error: entriesError } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: false })
        .limit(50)

      if (entriesError) {
        console.error("Error fetching diary entries:", entriesError)
        return
      }

      const diaryEntries = entriesData || []
      setEntries(diaryEntries)

      // Calculate stats
      const totalEntries = diaryEntries.length
      const milestones = diaryEntries.filter((entry) => entry.is_milestone).length

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const entriesThisMonth = diaryEntries.filter((entry) => {
        const entryDate = getEntryDate(entry)
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
      }).length

      const moodScores = diaryEntries.filter((entry) => entry.mood_score).map((entry) => entry.mood_score)

      const averageMoodScore =
        moodScores.length > 0 ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length : 0

      const moodCounts: { [key: string]: number } = {}
      diaryEntries.forEach((entry) => {
        if (entry.mood) {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
        }
      })

      const mostUsedMood = Object.keys(moodCounts).reduce((a, b) => (moodCounts[a] > moodCounts[b] ? a : b), "")

      // Calculate writing streak (simplified)
      let currentStreak = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateString = format(checkDate, "yyyy-MM-dd")

        const hasEntry = diaryEntries.some((entry) => entry.entry_date === dateString)
        if (hasEntry) {
          currentStreak++
        } else if (i > 0) {
          break
        }
      }

      setStats({
        totalEntries,
        currentStreak,
        averageMoodScore: Math.round(averageMoodScore * 10) / 10,
        mostUsedMood,
        entriesThisMonth,
        milestones,
      })
    } catch (error) {
      console.error("Error fetching diary data:", error)
    }

    setLoading(false)
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this diary entry?")) return

    try {
      const { error } = await supabase.from("diary_entries").delete().eq("id", entryId)

      if (!error) {
        fetchDiaryData()
      }
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: { [key: string]: string } = {
      happy: "😊",
      grateful: "🙏",
      peaceful: "😌",
      hopeful: "🌟",
      excited: "🎉",
      content: "😌",
      neutral: "😐",
      tired: "😴",
      stressed: "😰",
      anxious: "😟",
      sad: "😢",
      angry: "😠",
      overwhelmed: "🤯",
    }
    return moodEmojis[mood] || "😐"
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p className="text-muted-foreground">Please sign in to access your personal diary.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Diary</h1>
          <p className="text-muted-foreground">Your private space for thoughts and reflections</p>
        </div>
        <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write New Diary Entry</DialogTitle>
            </DialogHeader>
            <DiaryEntryForm
              onSave={() => {
                setShowNewEntry(false)
                fetchDiaryData()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Smile className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold">{stats.averageMoodScore}</div>
            <div className="text-sm text-muted-foreground">Avg Mood</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{stats.entriesThisMonth}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{stats.milestones}</div>
            <div className="text-sm text-muted-foreground">Milestones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">{getMoodEmoji(stats.mostUsedMood)}</div>
            <div className="text-sm font-medium capitalize">{stats.mostUsedMood || "N/A"}</div>
            <div className="text-sm text-muted-foreground">Top Mood</div>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList>
          <TabsTrigger value="recent">Recent Entries</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
                      <div className="bg-gray-200 rounded h-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No diary entries yet</h3>
                <p className="text-muted-foreground mb-4">Start your journaling journey by writing your first entry.</p>
                <Button onClick={() => setShowNewEntry(true)}>Write First Entry</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            {format(getEntryDate(entry), "dd")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">
                              {entry.title || format(getEntryDate(entry), "EEEE, MMMM do")}
                            </h3>
                            {entry.is_milestone && (
                              <Badge variant="secondary">
                                <Star className="h-3 w-3 mr-1" />
                                Milestone
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{format(getEntryDate(entry), "MMM dd, yyyy")}</span>
                            {entry.mood && (
                              <span className="flex items-center">
                                {getMoodEmoji(entry.mood)} {entry.mood} ({entry.mood_score}/10)
                              </span>
                            )}
                            {entry.location && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {entry.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                        {entry.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedEntry(entry)}>
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-4">
            {entries
              .filter((entry) => entry.is_milestone)
              .map((entry) => (
                <Card key={entry.id} className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-semibold">{entry.title || format(getEntryDate(entry), "EEEE, MMMM do")}</h3>
                      <Badge>Milestone</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">{entry.content}</p>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(getEntryDate(entry), { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Writing Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Detailed analytics coming soon! Track your mood trends, writing patterns, and personal growth over
                  time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Diary Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <DiaryEntryForm
              existingEntry={editingEntry}
              onSave={() => {
                setEditingEntry(null)
                fetchDiaryData()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry
                ? selectedEntry.title || format(getEntryDate(selectedEntry), "EEEE, MMMM do")
                : "Diary Entry"}
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{format(getEntryDate(selectedEntry), "MMM dd, yyyy")}</span>
                {selectedEntry.mood && (
                  <span className="flex items-center">
                    {getMoodEmoji(selectedEntry.mood)} {selectedEntry.mood} ({selectedEntry.mood_score}/10)
                  </span>
                )}
                {selectedEntry.location && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedEntry.location}
                  </span>
                )}
              </div>

              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>

              {(selectedEntry.category || selectedEntry.tags.length > 0) && (
                <div className="flex items-center space-x-2 pt-4 border-t">
                  {selectedEntry.category && <Badge variant="outline">{selectedEntry.category}</Badge>}
                  {selectedEntry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
