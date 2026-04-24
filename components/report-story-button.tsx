"use client"

import { useState } from "react"
import { Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AuthModal } from "@/components/auth-modal"

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "violence", label: "Violence or dangerous content" },
  { value: "sexual_content", label: "Sexual or inappropriate content" },
  { value: "privacy", label: "Privacy violation" },
  { value: "misinformation", label: "Misinformation or false claims" },
  { value: "other", label: "Other" },
]

interface ReportStoryButtonProps {
  storyId: string
  storyAuthorId: string
  variant?: "icon" | "menu"
}

export function ReportStoryButton({ storyId, storyAuthorId, variant = "icon" }: ReportStoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleOpenChange = (open: boolean) => {
    if (open && !user) {
      setShowAuthModal(true)
      return
    }
    setIsOpen(open)
    if (!open) {
      setSelectedReason("")
      setAdditionalDetails("")
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedReason) return

    // Prevent users from reporting their own stories
    if (user.id === storyAuthorId) {
      toast({
        title: "Cannot report own story",
        description: "You cannot report your own story.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Check if user already reported this story
      const { data: existingReport } = await supabase
        .from("reports")
        .select("id")
        .eq("reporter_id", user.id)
        .eq("reported_story_id", storyId)
        .maybeSingle()

      if (existingReport) {
        toast({
          title: "Already reported",
          description: "You have already reported this story. Our team is reviewing it.",
        })
        setIsOpen(false)
        return
      }

      // Submit the report
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_story_id: storyId,
        reported_user_id: storyAuthorId,
        report_type: selectedReason,
        reason: additionalDetails || null,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this story shortly.",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error submitting report:", error)
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {variant === "icon" ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Flag className="h-4 w-4" />
              <span className="sr-only">Report story</span>
            </Button>
          ) : (
            <button className="flex w-full items-center px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded">
              <Flag className="h-4 w-4 mr-2" />
              Report Story
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Story</DialogTitle>
            <DialogDescription>
              Help us understand what's wrong with this story. Your report is confidential.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Why are you reporting this story?</Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                {REPORT_REASONS.map((reason) => (
                  <div key={reason.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={reason.value} id={reason.value} />
                    <Label htmlFor={reason.value} className="font-normal cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                placeholder="Provide any additional context that might help us review this report..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedReason || isSubmitting}
              variant="destructive"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="signin"
      />
    </>
  )
}
