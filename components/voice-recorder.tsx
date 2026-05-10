"use client"

import { upload } from "@vercel/blob/client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Trash2, Upload, Pause, Play } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, duration: number) => void
  onCancel: () => void
}

export function VoiceRecorder({
  onAudioReady,
  onCancel,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 64000,
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        })

        setAudioBlob(blob)

        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        stream.getTracks().forEach((track) => track.stop())
      }

      // Save chunks every second
      mediaRecorder.start(1000)

      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      toast({
        title: "Recording started",
        description: "Speak clearly to share your story",
      })
    } catch (error) {
      console.error(error)

      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      setIsRecording(false)
      setIsPaused(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePauseRecording = () => {
    if (!mediaRecorderRef.current) return

    if (isPaused) {
      mediaRecorderRef.current.resume()

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      setIsPaused(false)

      toast({
        title: "Recording resumed",
      })
    } else {
      mediaRecorderRef.current.pause()

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      setIsPaused(true)

      toast({
        title: "Recording paused",
      })
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }

    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
  }

  const uploadRecording = async () => {
    if (!audioBlob) return

    setIsUploading(true)

    try {
      const fileName = `voice-story-${Date.now()}.webm`

      const uploadedBlob = await upload(fileName, audioBlob, {
        access: "public",
        handleUploadUrl: "/api/upload-audio",
      })

      onAudioReady(uploadedBlob.url, duration)

      toast({
        title: "Recording uploaded",
        description: "Now add a title for your story",
      })
    } catch (error) {
      console.error(error)

      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs}:${mins
        .toString()
        .padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`
    }

    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">
          {!audioBlob
            ? "Record Your Story"
            : "Preview Your Recording"}
        </h3>

        <p className="text-sm text-muted-foreground">
          {!audioBlob
            ? "Press the microphone to start recording"
            : "Listen to your recording or record again"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {!audioBlob ? (
          <>
            <div className="relative flex gap-3">
              <Button
                size="lg"
                onClick={
                  isRecording ? stopRecording : startRecording
                }
                className={`h-24 w-24 rounded-full ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }`}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>

              {isRecording && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={togglePauseRecording}
                  className="h-24 w-24 rounded-full"
                >
                  {isPaused ? (
                    <Play className="h-8 w-8" />
                  ) : (
                    <Pause className="h-8 w-8" />
                  )}
                </Button>
              )}
            </div>

            <div className="text-2xl font-mono font-semibold">
              {formatTime(duration)}
            </div>

            {isRecording && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {isPaused
                  ? "Recording paused..."
                  : "Recording in progress..."}
              </p>
            )}
          </>
        ) : (
          <>
            <audio
              src={audioUrl || ""}
              controls
              className="w-full max-w-md"
            />

            <div className="text-lg font-semibold">
              Duration: {formatTime(duration)}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={deleteRecording}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <Trash2 className="h-4 w-4" />
                Delete & Re-record
              </Button>

              <Button
                onClick={uploadRecording}
                disabled={isUploading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />

                {isUploading
                  ? "Uploading..."
                  : "Use This Recording"}
              </Button>
            </div>
          </>
        )}
      </div>

      <Button
        onClick={onCancel}
        variant="ghost"
        className="mt-4"
      >
        Cancel
      </Button>
    </div>
  )
}
