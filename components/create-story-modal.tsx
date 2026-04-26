"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface CreateStoryModalProps {
  isOpen: boolean
  onClose: () => void
  onStoryCreated?: () => void
}

const categories = [
  "Family & Relationships",
  "Career & Work",
  "Education",
  "Personal Growth",
  "Community",
  "Overcoming Challenges",
]

const contentWarnings = [
  "Mental Health",
  "Violence",
  "Substance Abuse",
  "Loss/Grief",
  "Discrimination",
  "Financial Hardship",
]

export function CreateStoryModal({ isOpen, onClose, onStoryCreated }: CreateStoryModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [location, setLocation] = useState("")
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleWarningToggle = (warning: string) => {
    setSelectedWarnings((prev) => (prev.includes(warning) ? prev.filter((w) => w !== warning) : [...prev, warning]))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to share a story.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from("stories").insert({
        title: title.trim(),
        content: content.trim(),
        category,
        location: location.trim() || null,
        content_warnings: selectedWarnings,
        author_id: user.id,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Story shared!",
        description: "Your story has been shared with the community.",
      })

      // Reset form
      setTitle("")
      setContent("")
      setCategory("")
      setLocation("")
      setSelectedWarnings([])
      onClose()
      onStoryCreated?.()
    } catch (error: any) {
      console.error("Error creating story:", error)
      toast({
        title: "Error creating story",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setCategory("")
    setLocation("")
    setSelectedWarnings([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Share Your Story</DialogTitle>
          <DialogDescription>
            Your story matters. Someone out there needs to hear it. Share your experience to help others heal and
            connect.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              placeholder="Give your story a meaningful title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground text-right">{title.length}/200 characters</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category that fits your story" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Cape Town, Western Cape"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Content Warnings (Optional)</Label>
            <p className="text-sm text-muted-foreground">Help others prepare for sensitive content</p>
            <div className="flex flex-wrap gap-2">
              {contentWarnings.map((warning) => (
                <Badge
                  key={warning}
                  variant={selectedWarnings.includes(warning) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleWarningToggle(warning)}
                >
                  {warning}
                  {selectedWarnings.includes(warning) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
            {selectedWarnings.length > 0 && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 rounded-md border border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-800">
                  Your story will include content warnings for: {selectedWarnings.join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Your Story *</Label>
            <Textarea
              id="content"
              placeholder="Share your story here... Remember, your experience might be exactly what someone else needs to hear."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
              maxLength={10000}
            />
            <div className="text-xs text-muted-foreground text-right">{content.length}/10,000 characters</div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || !category || loading}>
              {loading ? "Sharing..." : "Share Story"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
