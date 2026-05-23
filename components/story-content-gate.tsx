"use client"

import { useState, useRef, useCallback } from "react"
import { FormattedText } from "@/components/formatted-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic } from "lucide-react"

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
  // Voice player state
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isAudioLoaded, setIsAudioLoaded] = useState(false)

  // Format duration helper
  const formatDuration = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return "0:00"
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Voice player handlers
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSeek = useCallback((value: number[]) => {
    if (!audioRef.current || !isAudioLoaded) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }, [isAudioLoaded])

  const handleSkipBack = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
  }, [])

  const handleSkipForward = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
  }, [duration])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (!audioRef.current) return
    const audioDuration = audioRef.current.duration
    if (isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration)
      setIsAudioLoaded(true)
    }
  }, [])

  const handleDurationChange = useCallback(() => {
    if (!audioRef.current) return
    const audioDuration = audioRef.current.duration
    if (isFinite(audioDuration) && audioDuration > 0) {
      setDuration(audioDuration)
      setIsAudioLoaded(true)
    }
  }, [])

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }, [])

  // Always show full content - no login required to read
  if (isVoiceStory && audioUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Voice Story</h3>
          <Badge variant="secondary">Audio Recording</Badge>
        </div>
        
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onDurationChange={handleDurationChange}
            onCanPlay={handleDurationChange}
            onEnded={handleAudioEnded}
            className="hidden"
          />
          
          {/* Voice story header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Voice Story</p>
              <p className="text-xs text-muted-foreground">
                {isAudioLoaded ? `Duration: ${formatDuration(duration)}` : "Loading audio..."}
              </p>
            </div>
            {/* Mute button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-10 w-10 p-0 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Volume2 className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mb-6">
            <Slider
              value={[isAudioLoaded && duration > 0 ? currentTime : 0]}
              max={isAudioLoaded && duration > 0 ? duration : 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full cursor-pointer"
              disabled={!isAudioLoaded}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{formatDuration(currentTime)}</span>
              <span>{isAudioLoaded ? formatDuration(duration) : "--:--"}</span>
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipBack}
              disabled={!isAudioLoaded}
              className="h-12 w-12 p-0 rounded-full hover:bg-primary/10"
              title="Skip back 10 seconds"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={handlePlayPause}
              disabled={!isAudioLoaded}
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
              disabled={!isAudioLoaded}
              className="h-12 w-12 p-0 rounded-full hover:bg-primary/10"
              title="Skip forward 10 seconds"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Listening progress indicator */}
          {isAudioLoaded && duration > 0 && (
            <div className="mt-6 pt-4 border-t border-primary/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {currentTime > 0 ? `${Math.round((currentTime / duration) * 100)}% listened` : "Not started"}
                </span>
                <span className="text-muted-foreground">
                  {currentTime > 0 ? `${formatDuration(duration - currentTime)} remaining` : formatDuration(duration)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground text-center">
          Listen to this story shared as a voice recording
        </p>
      </div>
    )
  }

  return (
    <div className="prose prose-gray max-w-none font-serif">
      <FormattedText content={content} />
    </div>
  )
}
