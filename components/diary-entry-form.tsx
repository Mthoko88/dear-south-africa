"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Calendar, MapPin, Tag, Star, X } from "lucide-react"
import { format } from "date-fns"
import { VoiceRecorder } from "@/components/voice-recorder"

interface DiaryEntryFormProps {
  existingEntry?: any
  onSave: () => void
  entryType?: "written" | "voice"
}

const moodOptions = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "grateful", label: "Grateful", emoji: "🙏" },
  { value: "peaceful", label: "Peaceful", emoji: "😌" },
  { value: "hopeful", label: "Hopeful", emoji: "🌟" },
  { value: "excited", label: "Excited", emoji: "🎉" },
  { value: "content", label: "Content", emoji: "😌" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "tired", label: "Tired", emoji: "😴" },
  { value: "stressed", label: "Stressed", emoji: "😰" },
  { value: "anxious", label: "Anxious", emoji: "😟" },
  { value: "sad", label: "Sad", emoji: "😢" },
  { value: "angry", label: "Angry", emoji: "😠" },
  { value: "overwhelmed", label: "Overwhelmed", emoji: "🤯" },
]

const categoryOptions = [
  "Personal Growth",
  "Relationships",
  "Work & Career",
  "Health & Wellness",
  "Family",
  "Dreams & Goals",
  "Challenges",
  "Gratitude",
  "Memories",
  "Reflections",
  "Daily Life",
  "Other",
]

const commonTags = [
  "reflection",
  "growth",
  "challenge",
  "success",
  "family",
  "work",
  "health",
  "relationships",
  "goals",
  "gratitude",
  "learning",
  "change",
]

export function DiaryEntryForm({ existingEntry, onSave, entryType = "written" }: DiaryEntryFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(entryType === "voice")

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "",
    mood_score: 5,
    category: "",
    location: "",
    tags: [] as string[],
    is_milestone: false,
    entry_date: format(new Date(), "yyyy-MM-dd"),
  })

  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    if (existingEntry) {
      setFormData({
        title: existingEntry.title || "",
        content: existingEntry.content || "",
        mood: existingEntry.mood || "",
        mood_score: existingEntry.mood_score || 5,
        category: existingEntry.category || "",
        location: existingEntry.location || "",
        tags: existingEntry.tags || [],
        is_milestone: existingEntry.is_milestone || false,
        entry_date: existingEntry.entry_date || format(new Date(), "yyyy-MM-dd"),
      })
      if (existingEntry.audio_url) {
        setAudioUrl(existingEntry.audio_url)
        setShowVoiceRecorder(false)
      }
    }
  }, [existingEntry])

  const handleAudioReady = (url: string, duration: number) => {
    setAudioUrl(url)
    setAudioDuration(duration)
    setShowVoiceRecorder(false)
  }

  const handleVoiceCancel = () => {
    setShowVoiceRecorder(false)
    onSave()
  }

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue.",
        variant: "destructive",
      })
      return
    }

    if (entryType === "voice" && !audioUrl) {
      toast({
        title: "Audio required",
        description: "Please record your diary entry.",
        variant: "destructive",
      })
      return
    }

    if (entryType === "written" && !formData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please write something in your diary entry.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const entryData = {
        user_id: user.id,
        title: formData.title.trim() || null,
        content: entryType === "written" ? formData.content.trim() : null,
        audio_url: entryType === "voice" ? audioUrl : null,
        entry_type: entryType,
        mood: formData.mood || null,
        mood_score: formData.mood_score,
        category: formData.category || null,
        location: formData.location.trim() || null,
        tags: formData.tags,
        is_milestone: formData.is_milestone,
        entry_date: formData.entry_date,
      }

      if (existingEntry) {
        const { error } = await supabase.from("diary_entries").update(entryData).eq("id", existingEntry.id)

        if (error) throw error

        toast({
          title: "Entry updated!",
          description: "Your diary entry has been saved.",
        })
      } else {
        const { error } = await supabase.from("diary_entries").insert(entryData)

        if (error) throw error

        toast({
          title: "Entry saved!",
          description: "Your diary entry has been created.",
        })
      }

      onSave()
    } catch (error: any) {
      console.error("Error saving diary entry:", error)

      if (error?.code === "42P01") {
        toast({
          title: "Feature not ready",
          description: "The diary feature is still being set up. Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error saving entry",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    }

    setLoading(false)
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
    }
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  if (showVoiceRecorder && !audioUrl) {
    return <VoiceRecorder onAudioReady={handleAudioReady} onCancel={handleVoiceCancel} />
  }

  return (
    <div className="space-y-6">
      {/* Date and Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entry-date" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Entry Date
          </Label>
          <Input
            id="entry-date"
            type="date"
            value={formData.entry_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, entry_date: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry-title">Title (Optional)</Label>
          <Input
            id="entry-title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Give your entry a title..."
          />
        </div>
      </div>

      {/* Content */}
      {entryType === "voice" && audioUrl ? (
        <div className="space-y-2">
          <Label>Your Voice Recording</Label>
          <div className="border rounded-lg p-4 space-y-3">
            <audio src={audioUrl} controls className="w-full" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Duration: {Math.floor(audioDuration / 60)}:{(audioDuration % 60).toString().padStart(2, "0")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAudioUrl(null)
                  setShowVoiceRecorder(true)
                }}
              >
                Re-record
              </Button>
            </div>
          </div>
        </div>
      ) : entryType === "written" ? (
        <div className="space-y-2">
          <Label htmlFor="entry-content">Your Thoughts *</Label>
          <Textarea
            id="entry-content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="What's on your mind today? How are you feeling? What happened? What are you grateful for?"
            className="min-h-[200px]"
          />
        </div>
      ) : null}

      {/* Mood and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mood">How are you feeling?</Label>
          <Select value={formData.mood} onValueChange={(value) => setFormData((prev) => ({ ...prev, mood: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select your mood" />
            </SelectTrigger>
            <SelectContent>
              {moodOptions.map((mood) => (
                <SelectItem key={mood.value} value={mood.value}>
                  <span className="flex items-center">
                    <span className="mr-2">{mood.emoji}</span>
                    {mood.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mood Intensity */}
      {formData.mood && (
        <div className="space-y-2">
          <Label htmlFor="mood-score">Mood Intensity (1-10)</Label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              id="mood-score"
              min="1"
              max="10"
              value={formData.mood_score}
              onChange={(e) => setFormData((prev) => ({ ...prev, mood_score: Number(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm font-medium w-8">{formData.mood_score}</span>
          </div>
        </div>
      )}

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          Location (Optional)
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
          placeholder="Where are you writing from?"
        />
      </div>

      {/* Tags */}
      <div className="space-y-3">
        <Label className="flex items-center">
          <Tag className="h-4 w-4 mr-2" />
          Tags
        </Label>

        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}

        {/* Add New Tag */}
        <div className="flex space-x-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag(newTag)
              }
            }}
          />
          <Button type="button" variant="outline" onClick={() => addTag(newTag)} disabled={!newTag.trim()}>
            Add
          </Button>
        </div>

        {/* Common Tags */}
        <div className="flex flex-wrap gap-2">
          {commonTags
            .filter((tag) => !formData.tags.includes(tag))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>

      {/* Milestone */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-milestone"
          checked={formData.is_milestone}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_milestone: checked as boolean }))}
        />
        <Label htmlFor="is-milestone" className="flex items-center cursor-pointer">
          <Star className="h-4 w-4 mr-2" />
          Mark this as a milestone or important moment
        </Label>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onSave}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={
            loading || (entryType === "written" && !formData.content.trim()) || (entryType === "voice" && !audioUrl)
          }
        >
          {loading ? "Saving..." : existingEntry ? "Update Entry" : "Save Entry"}
        </Button>
      </div>
    </div>
  )
}
