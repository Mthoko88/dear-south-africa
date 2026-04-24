"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, ImagePlus, Video, Upload, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaFile {
  id: string
  url: string
  type: "image" | "video"
  name: string
  uploading?: boolean
  progress?: number
}

interface MediaUploadProps {
  images: string[]
  videoUrl: string | null
  onImagesChange: (images: string[]) => void
  onVideoChange: (videoUrl: string | null) => void
  maxImages?: number
  disabled?: boolean
}

export function MediaUpload({
  images,
  videoUrl,
  onImagesChange,
  onVideoChange,
  maxImages = 5,
  disabled = false,
}: MediaUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<MediaFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Upload error:", error)
      return null
    }
  }

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return

      const fileArray = Array.from(files)
      
      // Separate images and videos
      const imageFiles = fileArray.filter((f) => f.type.startsWith("image/"))
      const videoFiles = fileArray.filter((f) => f.type.startsWith("video/"))

      // Check image limit
      if (images.length + imageFiles.length > maxImages) {
        toast({
          title: "Too many images",
          description: `You can only upload up to ${maxImages} images.`,
          variant: "destructive",
        })
        return
      }

      // Check video limit (only 1 video allowed)
      if (videoUrl && videoFiles.length > 0) {
        toast({
          title: "Video limit reached",
          description: "You can only upload one video per story.",
          variant: "destructive",
        })
        return
      }

      // Check file sizes
      for (const file of fileArray) {
        const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 100MB for video, 10MB for images
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the ${file.type.startsWith("video/") ? "100MB" : "10MB"} limit.`,
            variant: "destructive",
          })
          return
        }
      }

      // Create temporary upload entries
      const tempFiles: MediaFile[] = fileArray.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
        name: file.name,
        uploading: true,
        progress: 0,
      }))

      setUploadingFiles((prev) => [...prev, ...tempFiles])

      // Upload files and collect results
      const uploadedImages: string[] = []
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const tempFile = tempFiles[i]

        const uploadedUrl = await uploadFile(file)

        if (uploadedUrl) {
          if (tempFile.type === "image") {
            uploadedImages.push(uploadedUrl)
          } else {
            onVideoChange(uploadedUrl)
          }
        } else {
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          })
        }

        // Remove from uploading list
        setUploadingFiles((prev) => prev.filter((f) => f.id !== tempFile.id))
      }
      
      // Add all uploaded images at once to avoid closure issues
      if (uploadedImages.length > 0) {
        onImagesChange([...images, ...uploadedImages])
      }
    },
    [images, videoUrl, maxImages, disabled, onImagesChange, onVideoChange, toast]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
  }

  const removeVideo = () => {
    onVideoChange(null)
  }

  const hasMedia = images.length > 0 || videoUrl || uploadingFiles.length > 0

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled) {
            document.getElementById("media-upload-input")?.click()
          }
        }}
      >
        <input
          id="media-upload-input"
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Drop images or video here</p>
            <p className="text-xs text-muted-foreground">
              Up to {maxImages} images (10MB each) and 1 video (100MB)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={disabled}>
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </div>

      {/* Media preview grid */}
      {hasMedia && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Uploaded images */}
          {images.map((url, index) => (
            <Card
              key={url}
              className="relative aspect-square overflow-hidden group"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-white text-xs">Image {index + 1}</span>
              </div>
            </Card>
          ))}

          {/* Video preview */}
          {videoUrl && (
            <Card className="relative aspect-square overflow-hidden group col-span-2">
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                controls={false}
                muted
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removeVideo}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center gap-2">
                <Video className="h-4 w-4 text-white" />
                <span className="text-white text-xs">Video</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-3">
                  <Video className="h-8 w-8 text-white" />
                </div>
              </div>
            </Card>
          )}

          {/* Uploading files */}
          {uploadingFiles.map((file) => (
            <Card
              key={file.id}
              className="relative aspect-square overflow-hidden flex items-center justify-center bg-muted"
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <Video className="h-12 w-12 text-muted-foreground opacity-50" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <span className="text-white text-xs mt-2">Uploading...</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info text */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Images will appear in your story alongside your text. Videos will be embedded and playable by readers.
          Supported formats: JPG, PNG, GIF, WebP, MP4, WebM.
        </p>
      </div>
    </div>
  )
}
