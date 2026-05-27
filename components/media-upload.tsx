"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, ImagePlus, Video, Upload, Loader2, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface MediaItem {
  url: string
  caption?: string | null
  credit?: string | null
}

interface MediaFile {
  id: string
  url: string
  type: "image" | "video"
  name: string
  uploading?: boolean
  progress?: number
}

interface MediaUploadProps {
  images: MediaItem[]
  videoUrl: string | null
  onImagesChange: (images: MediaItem[]) => void
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
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
      const uploadedImages: MediaItem[] = []
      
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const tempFile = tempFiles[i]

        const uploadedUrl = await uploadFile(file)

        if (uploadedUrl) {
          if (tempFile.type === "image") {
            uploadedImages.push({ url: uploadedUrl, caption: null, credit: null })
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
        // Expand the first newly uploaded image to encourage adding metadata
        setExpandedIndex(images.length)
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
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1)
    }
  }

  const updateImageMetadata = (index: number, field: 'caption' | 'credit', value: string) => {
    const newImages = [...images]
    newImages[index] = {
      ...newImages[index],
      [field]: value || null
    }
    onImagesChange(newImages)
  }

  const removeVideo = () => {
    onVideoChange(null)
  }

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index)
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

      {/* Media list with metadata fields */}
      {hasMedia && (
        <div className="space-y-3">
          {/* Uploaded images */}
          {images.map((item, index) => (
            <Card
              key={item.url}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-3 p-3">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  <img
                    src={item.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info and controls */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Image {index + 1}
                        {(item.caption || item.credit) && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            (has metadata)
                          </span>
                        )}
                      </p>
                      {!expandedIndex || expandedIndex !== index ? (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.caption || item.credit 
                            ? `${item.caption ? 'Caption added' : ''} ${item.caption && item.credit ? '•' : ''} ${item.credit ? 'Credit added' : ''}`
                            : 'Click to add caption & credit'
                          }
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleExpanded(index)}
                      >
                        {expandedIndex === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeImage(index)}
                        disabled={disabled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded metadata fields */}
                  {expandedIndex === index && (
                    <div className="mt-3 space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`caption-${index}`} className="text-xs">
                          Caption (optional)
                        </Label>
                        <Input
                          id={`caption-${index}`}
                          placeholder="Describe the image..."
                          value={item.caption || ''}
                          onChange={(e) => updateImageMetadata(index, 'caption', e.target.value)}
                          disabled={disabled}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`credit-${index}`} className="text-xs">
                          Source / Credit (optional)
                        </Label>
                        <Input
                          id={`credit-${index}`}
                          placeholder="e.g. Photo by John Doe / Reuters"
                          value={item.credit || ''}
                          onChange={(e) => updateImageMetadata(index, 'credit', e.target.value)}
                          disabled={disabled}
                          className="h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Always credit the original photographer or source
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {/* Video preview */}
          {videoUrl && (
            <Card className="overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  <video
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Video</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Video attached to story
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={removeVideo}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Uploading files */}
          {uploadingFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="flex items-start gap-3 p-3">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {file.type === "image" ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover opacity-50"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Uploading...</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info text */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-medium text-foreground mb-1">Image Credits</p>
          <p>
            If you use images from the internet or other sources, please add the appropriate credit. 
            This helps respect copyright and gives proper attribution to photographers and sources.
          </p>
        </div>
      </div>
    </div>
  )
}
