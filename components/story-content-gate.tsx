"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { FormattedText } from "@/components/formatted-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

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
  const audioRef = useRef<HTMLAudioElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Format time helper
  const formatDuration = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return "0:00"
    }

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Retry loading audio
  const retryLoadAudio = useCallback(() => {
    if (!audioRef.current || !audioUrl) return

    setAudioError(null)
    setIsRetrying(true)
    setIsAudioLoaded(false)

    audioRef.current.src = ""

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
        setIsRetrying(false)
      }
    }, 500)
  }, [audioUrl])

  // Play / Pause
  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error("[v0] Audio play error:", err)
      setAudioError("Failed to play audio")
    }
  }, [isPlaying])

  // Seek
  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current) return

    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }, [])

  // Skip back
  const handleSkipBack = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 10
    )
  }, [])

  // Skip forward
  const handleSkipForward = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.currentTime = Math.min(
      duration,
      audioRef.current.currentTime + 10
    )
  }, [duration])

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.muted = !audioRef.current.muted
    setIsMuted(audioRef.current.muted)
  }, [])

  // Time updates
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)
  }, [])

  // Audio ended
  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)

    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [])

  // Load audio on mount
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log("[v0] Loading audio:", audioUrl)

      setAudioError(null)
      setIsAudioLoaded(false)

      audioRef.current.load()
    }
  }, [audioUrl])

  // Voice Story UI
  if (isVoiceStory && audioUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Voice Story</h3>

          <Badge variant="secondary">
            Audio Recording
          </Badge>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            crossOrigin="anonymous"
            onLoadedMetadata={() => {
              if (!audioRef.current) return

              const audioDuration = audioRef.current.duration

              console.log(
                "[v0] Metadata loaded:",
                audioDuration
              )

              setDuration(
                isFinite(audioDuration)
                  ? audioDuration
                  : 0
              )

              setIsAudioLoaded(true)
              setAudioError(null)
            }}
            onCanPlay={() => {
              console.log("[v0] Audio can play")

              setIsAudioLoaded(true)
              setAudioError(null)
            }}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleAudioEnded}
            onError={(e) => {
              const audio = e.currentTarget

              console.error(
                "[v0] Audio failed:",
                audio.error
              )

              setAudioError("Failed to load audio")
              setIsAudioLoaded(false)
            }}
            className="hidden"
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-primary">
                Voice Story
              </p>

              <p className="text-xs text-muted-foreground">
                {audioError ? (
                  <span className="text-destructive">
                    {audioError}
                  </span>
                ) : isAudioLoaded ? (
                  `Duration: ${formatDuration(duration)}`
                ) : isRetrying ? (
                  "Retrying..."
                ) : (
                  "Loading audio..."
                )}
              </p>
            </div>

            {/* Retry */}
            {audioError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={retryLoadAudio}
                className="h-10 w-10 p-0 rounded-full"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            )}

            {/* Mute */}
            {!audioError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-10 w-10 p-0 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {/* Error */}
          {audioError && (
            <div className="flex items-center justify-center gap-2 py-8">
              <AlertCircle className="h-5 w-5 text-destructive" />

              <span className="text-sm text-muted-foreground">
                Unable to load audio. Please retry.
              </span>
            </div>
          )}

          {/* Player */}
          {!audioError && (
            <>
              {/* Progress */}
              <div className="mb-6">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full cursor-pointer"
                  disabled={!!audioError}
                />

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    {formatDuration(currentTime)}
                  </span>

                  <span>
                    {isAudioLoaded
                      ? formatDuration(duration)
                      : "--:--"}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipBack}
                  disabled={!!audioError}
                  className="h-12 w-12 p-0 rounded-full"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  variant="default"
                  size="lg"
                  onClick={handlePlayPause}
                  disabled={!!audioError}
                  className="h-16 w-16 p-0 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipForward}
                  disabled={!!audioError}
                  className="h-12 w-12 p-0 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress indicator */}
              {duration > 0 && (
                <div className="mt-6 pt-4 border-t border-primary/10">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {currentTime > 0
                        ? `${Math.round(
                            (currentTime / duration) * 100
                          )}% listened`
                        : "Not started"}
                    </span>

                    <span>
                      {currentTime > 0
                        ? `${formatDuration(
                            duration - currentTime
                          )} remaining`
                        : formatDuration(duration)}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Listen to this story shared as a voice recording
        </p>
      </div>
    )
  }

  // Text Story
  return (
    <div className="prose prose-gray max-w-none font-serif">
      <FormattedText content={content} />
    </div>
  )
}
