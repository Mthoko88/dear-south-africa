"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Trash2, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, duration: number) => void
  onCancel: () => void
}

export function VoiceRecorder({ onAudioReady, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
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
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)

      toast({
        title: "Recording started",
        description: "Speak clearly to share your story",
      })
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
  }

  const uploadRecording = async () => {
    if (!audioBlob) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      const fileName = `voice-story-${Date.now()}.webm`
      formData.append("audio", audioBlob, fileName)

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      onAudioReady(data.url, duration)

      toast({
        title: "Recording uploaded",
        description: "Now add a title for your story",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try recording again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{!audioBlob ? "Record Your Story" : "Preview Your Recording"}</h3>
        <p className="text-sm text-muted-foreground">
          {!audioBlob ? "Press the microphone to start recording" : "Listen to your recording or record again"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {!audioBlob ? (
          <>
            <div className="relative">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`h-24 w-24 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : ""}`}
              >
                {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              {isRecording && (
                <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-600 rounded-full animate-pulse" />
              )}
            </div>

            <div className="text-2xl font-mono font-semibold">{formatTime(duration)}</div>

            {isRecording && <p className="text-sm text-muted-foreground animate-pulse">Recording in progress...</p>}
          </>
        ) : (
          <>
            <audio src={audioUrl || ""} controls className="w-full max-w-md" />

            <div className="text-lg font-semibold">Duration: {formatTime(duration)}</div>

            <div className="flex gap-3">
              <Button onClick={deleteRecording} variant="outline" className="gap-2 bg-transparent">
                <Trash2 className="h-4 w-4" />
                Delete & Re-record
              </Button>

              <Button onClick={uploadRecording} disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Use This Recording"}
              </Button>
            </div>
          </>
        )}
      </div>

      <Button onClick={onCancel} variant="ghost" className="mt-4">
        Cancel
      </Button>
    </div>
  )
}
