"use client"

import { FormattedText } from "@/components/formatted-text"
import { Badge } from "@/components/ui/badge"

interface StoryContentGateProps {
  content: string
  audioUrl?: string | null
  isVoiceStory: boolean
  previewLength?: number
  previewSeconds?: number
}

export function StoryContentGate({
  content,
  audioUrl,
  isVoiceStory,
}: StoryContentGateProps) {
  // Always show full content - no login required to read
  if (isVoiceStory && audioUrl) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Voice Story</h3>
          <Badge variant="secondary">Audio Recording</Badge>
        </div>
        <div className="bg-muted rounded-lg p-6">
          <audio src={audioUrl} controls className="w-full" />
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Listen to this story shared as a voice recording
        </p>
      </div>
    )
  }

  return (
    <div className="prose max-w-none dark:prose-invert [&_*]:text-foreground">
  <div dangerouslySetInnerHTML={{ __html: content }} />
      <FormattedText content={content} />
    </div>
  )
}
