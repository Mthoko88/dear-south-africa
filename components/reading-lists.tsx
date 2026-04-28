"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Plus, Trash2, Eye, EyeOff, BookmarkPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface ReadingListsProps {
  storyId?: string
  showAddToList?: boolean
}

interface ReadingList {
  id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  item_count: number
}

export function ReadingLists({ storyId, showAddToList = false }: ReadingListsProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [readingLists, setReadingLists] = useState<ReadingList[]>([])
  const [loading, setLoading] = useState(true)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const [newList, setNewList] = useState({
    name: "",
    description: "",
    is_public: false,
  })

  /* ------------------------------------------------------------------------ */
  /* FETCH LISTS                                                              */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    if (user) void fetchLists()
  }, [user])

  const fetchLists = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Grab lists first -----------------------------------------------------
      const { data: lists, error: lErr } = await supabase
        .from("reading_lists")
        .select("id, name, description, is_public, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (lErr) throw lErr

      if (!lists || lists.length === 0) {
        setReadingLists([])
        setLoading(false)
        return
      }

      // Get counts in bulk ---------------------------------------------------
      const listIds = lists.map((l) => l.id)
      const { data: counts, error: cErr } = await supabase
        .from("reading_list_items")
        .select("reading_list_id, count(*)", { group: "reading_list_id" })
        .in("reading_list_id", listIds)

      if (cErr) throw cErr

      const countMap: Record<string, number> = {}
      counts?.forEach((c) => {
        // @ts-expect-error – PostgREST returns strings
        countMap[c.reading_list_id] = Number(c.count)
      })

      const listsWithCounts: ReadingList[] = lists.map((l) => ({
        ...l,
        item_count: countMap[l.id] ?? 0,
      }))

      setReadingLists(listsWithCounts)
    } catch (err: any) {
      /* Gracefully handle missing table during local preview
         (Postgres code 42P01 = undefined_table) */
      if (err?.code === "42P01") {
        console.warn("reading_lists table not found – did you run 20-reading-lists-schema.sql?")
      } else {
        console.error("Error fetching reading lists:", err)
        toast({
          title: "Error",
          description: "Failed to load reading lists.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* CRUD HELPERS                                                             */
  /* ------------------------------------------------------------------------ */
  const createList = async () => {
    if (!user || !newList.name.trim()) return
    try {
      const { data, error } = await supabase
        .from("reading_lists")
        .insert({
          user_id: user.id,
          name: newList.name.trim(),
          description: newList.description.trim() || null,
          is_public: newList.is_public,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: "List created!", description: data.name })
      setNewList({ name: "", description: "", is_public: false })
      setCreateDialogOpen(false)
      void fetchLists()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not create list.",
        variant: "destructive",
      })
    }
  }

  const deleteList = async (id: string) => {
    if (!confirm("Delete this reading list?")) return
    try {
      const { error } = await supabase.from("reading_lists").delete().eq("id", id)
      if (error) throw error
      toast({ title: "List deleted" })
      void fetchLists()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Failed to delete list.",
        variant: "destructive",
      })
    }
  }

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      const { error } = await supabase.from("reading_lists").update({ is_public: !isPublic }).eq("id", id)
      if (error) throw error
      void fetchLists()
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not update list.",
        variant: "destructive",
      })
    }
  }

  const addStory = async (listId: string) => {
    if (!storyId) return
    try {
      const { error } = await supabase.from("reading_list_items").insert({
        reading_list_id: listId,
        story_id: storyId,
      })
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already added" })
          return
        }
        throw error
      }
      toast({ title: "Added to list!" })
      setAddDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Could not add story.",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  /* ------------------------------------------------------------------------ */
  /* ADD-TO-LIST BUTTON ONLY                                                  */
  /* ------------------------------------------------------------------------ */
  if (showAddToList && storyId) {
    return (
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Reading List</DialogTitle>
          </DialogHeader>

          {readingLists.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">You have no reading lists yet.</p>
              <Button onClick={() => setCreateDialogOpen(true)}>Create Your First List</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {readingLists.map((l) => (
                <Button
                  key={l.id}
                  variant="outline"
                  className="w-full justify-between h-auto p-4 bg-transparent"
                  onClick={() => addStory(l.id)}
                >
                  <span>{l.name}</span>
                  <Badge variant="secondary">{l.item_count}</Badge>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setAddDialogOpen(false)
                  setCreateDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  /* ------------------------------------------------------------------------ */
  /* FULL LIST COMPONENT (DASHBOARD)                                          */
  /* ------------------------------------------------------------------------ */
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            My Reading Lists
          </span>

          {/* Create list button */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create List
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Reading List</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rl-name">Name</Label>
                  <Input
                    id="rl-name"
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rl-desc">Description (optional)</Label>
                  <Textarea
                    id="rl-desc"
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rl-public"
                    checked={newList.is_public}
                    onCheckedChange={(c) => setNewList({ ...newList, is_public: c as boolean })}
                  />
                  <Label htmlFor="rl-public">Make this list public</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createList} disabled={!newList.name.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : readingLists.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven’t created any reading lists yet.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {readingLists.map((l) => (
              <Card key={l.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link href={`/reading-lists/${l.id}`}>
                        <h4 className="font-medium hover:underline truncate">{l.name}</h4>
                      </Link>
                      {l.is_public ? (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>

                    {l.description && <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>}

                    <div className="text-xs text-muted-foreground mt-1">
                      {l.item_count} stories • {new Date(l.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublic(l.id, l.is_public)}
                      aria-label="Toggle visibility"
                    >
                      {l.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteList(l.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
