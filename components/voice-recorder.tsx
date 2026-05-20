"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Trash2, Upload, Pause, Play, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface VoiceRecorderProps {
  onAudioReady: (audioUrl: string, duration: number) => void
  onCancel: () => void
}

export function VoiceRecorder({ onAudioReady, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [audioLevels, setAudioLevels] = useState<number[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const MAX_DURATION = 1800 // 30 minutes max

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (audioContextRef.current) audioContextRef.current.close()
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
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
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms for better pause support
      setIsRecording(true)
      setIsPaused(false)
      setDuration(0)
      setAudioLevels([])

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Start audio visualization
      visualizeAudio()

      toast({
        title: "Recording started",
        description: "Speak clearly to share your story. You can pause anytime.",
      })
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record",
        variant: "destructive",
      })
    }
  }

  const visualizeAudio = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevels = () => {
      if (!analyserRef.current || isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateLevels)
        return
      }
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      
      setAudioLevels(prev => {
        const newLevels = [...prev, average / 255 * 100]
        // Keep only last 50 levels for visualization
        if (newLevels.length > 50) newLevels.shift()
        return newLevels
      })
      
      animationFrameRef.current = requestAnimationFrame(updateLevels)
    }
    
    updateLevels()
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      toast({
        title: "Recording paused",
        description: "Press play to continue recording",
      })
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
      
      toast({
        title: "Recording resumed",
        description: "Continue sharing your story",
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

  const deleteRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setAudioLevels([])
  }

  const restartRecording = () => {
    deleteRecording()
    startRecording()
  }

  const uploadRecording = async () => {
    if (!audioBlob) return

    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      const formData = new FormData()
      const fileName = `voice-story-${Date.now()}.webm`
      formData.append("audio", audioBlob, fileName)

      // Use XMLHttpRequest for upload progress tracking
      const xhr = new XMLHttpRequest()
      
      const uploadPromise = new Promise<{ url: string }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch {
              reject(new Error("Invalid response"))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"))
        })

        xhr.addEventListener("timeout", () => {
          reject(new Error("Upload timed out"))
        })

        xhr.open("POST", "/api/upload-audio")
        xhr.timeout = 600000 // 10 minute timeout for large files
        xhr.send(formData)
      })

      const data = await uploadPromise
      onAudioReady(data.url, duration)

      toast({
        title: "Recording uploaded",
        description: "Now add a title for your story",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try recording again",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
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
        <h3 className="text-lg font-semibold">
          {!audioBlob ? (isRecording ? (isPaused ? "Recording Paused" : "Recording...") : "Record Your Story") : "Preview Your Recording"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {!audioBlob 
            ? (isRecording 
                ? "You can pause, resume, or stop your recording anytime" 
                : "Press the microphone to start recording")
            : "Listen to your recording or record again"}
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {!audioBlob ? (
          <>
            {/* Audio visualization */}
            {isRecording && (
              <div className="flex items-end justify-center gap-1 h-16 w-full px-4">
                {audioLevels.slice(-30).map((level, i) => (
                  <div 
                    key={i} 
                    className={`w-2 rounded-full transition-all duration-75 ${isPaused ? 'bg-muted' : 'bg-primary'}`}
                    style={{ height: `${Math.max(4, level * 0.6)}px` }}
                  />
                ))}
                {audioLevels.length < 30 && [...Array(30 - audioLevels.length)].map((_, i) => (
                  <div key={`empty-${i}`} className="w-2 h-1 rounded-full bg-muted" />
                ))}
              </div>
            )}

            {/* Recording controls */}
            <div className="flex items-center gap-4">
              {isRecording && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={restartRecording}
                  className="h-14 w-14 rounded-full bg-transparent"
                  title="Restart recording"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              )}

              <div className="relative">
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`h-24 w-24 rounded-full ${isRecording ? "bg-red-600 hover:bg-red-700" : ""}`}
                >
                  {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
                {isRecording && !isPaused && (
                  <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-600 rounded-full animate-pulse" />
                )}
              </div>

              {isRecording && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="h-14 w-14 rounded-full bg-transparent"
                  title={isPaused ? "Resume recording" : "Pause recording"}
                >
                  {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                </Button>
              )}
            </div>

            <div className="text-2xl font-mono font-semibold">{formatTime(duration)}</div>

            {/* Duration progress bar */}
            {isRecording && (
              <div className="w-full space-y-1">
                <Progress value={(duration / MAX_DURATION) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {formatTime(MAX_DURATION - duration)} remaining
                </p>
              </div>
            )}

            {isRecording && (
              <p className={`text-sm ${isPaused ? 'text-muted-foreground' : 'text-muted-foreground animate-pulse'}`}>
                {isPaused ? "Paused - press play to continue" : "Recording in progress..."}
              </p>
            )}

            {/* Recording tips */}
            {!isRecording && (
              <div className="text-xs text-muted-foreground text-center space-y-1 mt-4">
                <p>Tips for a great recording:</p>
                <ul className="space-y-0.5">
                  <li>Find a quiet space</li>
                  <li>Speak clearly and at a natural pace</li>
                  <li>You can pause and resume anytime</li>
                  <li>Maximum recording length: 30 minutes</li>
                </ul>
              </div>
            )}
          </>
        ) : (
          <>
            <audio src={audioUrl || ""} controls className="w-full max-w-md" />

            <div className="text-lg font-semibold">Duration: {formatTime(duration)}</div>

            <div className="flex gap-3">
              <Button onClick={deleteRecording} variant="outline" className="gap-2 bg-transparent" disabled={isUploading}>
                <Trash2 className="h-4 w-4" />
                Delete & Re-record
              </Button>

              <Button onClick={uploadRecording} disabled={isUploading} className="gap-2">
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Use This Recording"}
              </Button>
            </div>

            {/* Upload progress indicator */}
            {isUploading && (
              <div className="w-full max-w-md space-y-2">
                <Progress value={uploadProgress} className="h-3" />
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress < 100 
                    ? `Uploading: ${uploadProgress}%` 
                    : "Processing..."}
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Large recordings may take a few minutes to upload
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Button onClick={onCancel} variant="ghost" className="mt-4">
        Cancel
      </Button>
    </div>
  )
}
