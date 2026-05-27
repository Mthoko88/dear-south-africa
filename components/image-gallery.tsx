"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface ImageMediaItem {
  url: string
  caption?: string | null
  credit?: string | null
}

interface ImageGalleryProps {
  images: (string | ImageMediaItem)[]
  coverImage?: string | null
  className?: string
}

// Helper to normalize image data (handles both string URLs and MediaItem objects)
function normalizeImages(images: (string | ImageMediaItem)[], coverImage?: string | null): ImageMediaItem[] {
  const normalized: ImageMediaItem[] = []
  
  // Add cover image first if it exists and isn't already in images
  if (coverImage) {
    const coverExists = images.some(img => 
      (typeof img === 'string' ? img : img.url) === coverImage
    )
    if (!coverExists) {
      normalized.push({ url: coverImage, caption: null, credit: null })
    }
  }
  
  // Add all images, converting strings to objects
  for (const img of images) {
    if (typeof img === 'string') {
      // Skip if this is the cover image we already added
      if (img === coverImage && normalized.length > 0 && normalized[0].url === coverImage) {
        continue
      }
      normalized.push({ url: img, caption: null, credit: null })
    } else {
      // Skip if this is the cover image we already added
      if (img.url === coverImage && normalized.length > 0 && normalized[0].url === coverImage) {
        continue
      }
      normalized.push(img)
    }
  }
  
  return normalized
}

function ImageWithLoader({ 
  src, 
  alt, 
  className,
  onLoad,
  priority = false 
}: { 
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  priority?: boolean
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse" />
      )}
      {hasError ? (
        <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Failed to load image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          className={cn(
            "object-cover w-full h-full transition-all duration-500",
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
            className
          )}
          onLoad={() => {
            setIsLoading(false)
            onLoad?.()
          }}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

// Caption/Credit overlay component for gallery view
function ImageCaption({ caption, credit, compact = false }: { caption?: string | null; credit?: string | null; compact?: boolean }) {
  if (!caption && !credit) return null
  
  return (
    <div className={cn(
      "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent",
      compact ? "p-2" : "p-3 pb-4"
    )}>
      {caption && (
        <p className={cn(
          "text-white font-medium line-clamp-2",
          compact ? "text-xs" : "text-sm"
        )}>
          {caption}
        </p>
      )}
      {credit && (
        <p className={cn(
          "text-white/70 italic",
          compact ? "text-[10px] mt-0.5" : "text-xs mt-1"
        )}>
          {credit}
        </p>
      )}
    </div>
  )
}

export function ImageGallery({ images, coverImage, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Normalize images to consistent format
  const allImages = normalizeImages(images, coverImage)

  if (allImages.length === 0) return null

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && !isAnimating) {
      setIsAnimating(true)
      setSelectedIndex(selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [selectedIndex, allImages.length, isAnimating])

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && !isAnimating) {
      setIsAnimating(true)
      setSelectedIndex(selectedIndex === allImages.length - 1 ? 0 : selectedIndex + 1)
      setTimeout(() => setIsAnimating(false), 300)
    }
  }, [selectedIndex, allImages.length, isAnimating])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "ArrowLeft") goToPrevious()
      if (e.key === "ArrowRight") goToNext()
      if (e.key === "Escape") closeLightbox()
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex, goToPrevious, goToNext])

  const GAP = "gap-1.5"
  const baseStyles = "rounded-xl overflow-hidden shadow-md ring-1 ring-black/5"
  const imageContainerStyles = "relative cursor-pointer group overflow-hidden"

  // Single image - show it full width with caption below
  if (allImages.length === 1) {
    const img = allImages[0]
    return (
      <div className={cn("relative", className)}>
        <figure>
          <div 
            className={cn("relative aspect-video w-full", baseStyles, imageContainerStyles)}
            onClick={() => openLightbox(0)}
          >
            <ImageWithLoader
              src={img.url}
              alt={img.caption || "Story image"}
              className="transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg transform scale-75 group-hover:scale-100" />
            </div>
          </div>
          {/* Caption and credit displayed below image like a news site */}
          {(img.caption || img.credit) && (
            <figcaption className="mt-2 px-1">
              {img.caption && (
                <p className="text-sm text-foreground">{img.caption}</p>
              )}
              {img.credit && (
                <p className="text-xs text-muted-foreground italic mt-0.5">{img.credit}</p>
              )}
            </figcaption>
          )}
        </figure>

        <LightboxDialog 
          images={allImages} 
          selectedIndex={selectedIndex} 
          onClose={closeLightbox} 
          onPrevious={goToPrevious} 
          onNext={goToNext}
          isAnimating={isAnimating}
        />
      </div>
    )
  }

  // 2 images - side by side
  if (allImages.length === 2) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn("grid grid-cols-2", GAP, baseStyles)}>
          {allImages.map((img, idx) => (
            <div 
              key={idx} 
              className={cn(imageContainerStyles, "aspect-square")}
              onClick={() => openLightbox(idx)}
            >
              <ImageWithLoader
                src={img.url}
                alt={img.caption || `Story image ${idx + 1}`}
                className="transition-transform duration-500 group-hover:scale-105"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
              </div>
              <ImageCaption caption={img.caption} credit={img.credit} compact />
            </div>
          ))}
        </div>
        {/* Combined captions below for multi-image */}
        <MultiImageCaptions images={allImages} />
        <LightboxDialog 
          images={allImages} 
          selectedIndex={selectedIndex} 
          onClose={closeLightbox} 
          onPrevious={goToPrevious} 
          onNext={goToNext}
          isAnimating={isAnimating}
        />
      </div>
    )
  }

  // 3 images - 1 large + 2 small stacked
  if (allImages.length === 3) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn("grid grid-cols-2", GAP, baseStyles)}>
          <div 
            className={cn(imageContainerStyles, "aspect-[3/4]")}
            onClick={() => openLightbox(0)}
          >
            <ImageWithLoader
              src={allImages[0].url}
              alt={allImages[0].caption || "Story image 1"}
              className="transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
            </div>
            <ImageCaption caption={allImages[0].caption} credit={allImages[0].credit} compact />
          </div>
          <div className={cn("grid grid-rows-2", GAP)}>
            {allImages.slice(1).map((img, idx) => (
              <div 
                key={idx} 
                className={imageContainerStyles}
                onClick={() => openLightbox(idx + 1)}
              >
                <ImageWithLoader
                  src={img.url}
                  alt={img.caption || `Story image ${idx + 2}`}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
                </div>
                <ImageCaption caption={img.caption} credit={img.credit} compact />
              </div>
            ))}
          </div>
        </div>
        <MultiImageCaptions images={allImages} />
        <LightboxDialog 
          images={allImages} 
          selectedIndex={selectedIndex} 
          onClose={closeLightbox} 
          onPrevious={goToPrevious} 
          onNext={goToNext}
          isAnimating={isAnimating}
        />
      </div>
    )
  }

  // 4+ images - 2x2 grid with +N overlay on 4th
  return (
    <div className={cn("relative", className)}>
      <div className={cn("grid grid-cols-2", GAP, baseStyles)}>
        {allImages.slice(0, 4).map((img, idx) => (
          <div 
            key={idx} 
            className={cn(imageContainerStyles, "aspect-square")}
            onClick={() => openLightbox(idx)}
          >
            <ImageWithLoader
              src={img.url}
              alt={img.caption || `Story image ${idx + 1}`}
              className="transition-transform duration-500 group-hover:scale-105"
              priority={idx === 0}
            />
            {idx === 3 && allImages.length > 4 ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] group-hover:bg-black/70 transition-all duration-300">
                <span className="text-white text-3xl font-bold drop-shadow-lg">+{allImages.length - 4}</span>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 drop-shadow-lg" />
                </div>
                <ImageCaption caption={img.caption} credit={img.credit} compact />
              </>
            )}
          </div>
        ))}
      </div>
      <MultiImageCaptions images={allImages.slice(0, 4)} />
      <LightboxDialog 
        images={allImages} 
        selectedIndex={selectedIndex} 
        onClose={closeLightbox} 
        onPrevious={goToPrevious} 
        onNext={goToNext}
        isAnimating={isAnimating}
      />
    </div>
  )
}

// Component to show combined credits for multi-image galleries
function MultiImageCaptions({ images }: { images: ImageMediaItem[] }) {
  // Collect unique credits
  const credits = images
    .map((img, idx) => img.credit ? { index: idx + 1, credit: img.credit } : null)
    .filter(Boolean) as { index: number; credit: string }[]
  
  if (credits.length === 0) return null
  
  // If all credits are the same, show just once
  const allSame = credits.every(c => c.credit === credits[0].credit)
  
  return (
    <div className="mt-2 px-1">
      <p className="text-xs text-muted-foreground italic">
        {allSame ? (
          credits[0].credit
        ) : (
          credits.map((c, idx) => (
            <span key={c.index}>
              {idx > 0 && " | "}
              <span className="not-italic font-medium">{c.index}.</span> {c.credit}
            </span>
          ))
        )}
      </p>
    </div>
  )
}

// Enhanced lightbox dialog component
function LightboxDialog({ 
  images, 
  selectedIndex, 
  onClose, 
  onPrevious, 
  onNext,
  isAnimating
}: { 
  images: ImageMediaItem[]
  selectedIndex: number | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  isAnimating: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Reset image loaded state when index changes
  useEffect(() => {
    setImageLoaded(false)
  }, [selectedIndex])

  const currentImage = selectedIndex !== null ? images[selectedIndex] : null

  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none backdrop-blur-sm"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-50 text-white hover:bg-white/20 h-10 w-10 rounded-full transition-all duration-200"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hover:scale-110"
              onClick={onPrevious}
              disabled={isAnimating}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12 rounded-full transition-all duration-200 hover:scale-110"
              onClick={onNext}
              disabled={isAnimating}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        <div className="flex flex-col items-center justify-center w-full h-full p-4 min-h-[50vh]">
          {currentImage && (
            <>
              <div className="relative flex-1 flex items-center justify-center">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={currentImage.url}
                  alt={currentImage.caption || `Story image ${(selectedIndex ?? 0) + 1}`}
                  className={cn(
                    "max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-all duration-300",
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                    isAnimating && "opacity-80"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
              
              {/* Caption and credit in lightbox */}
              {(currentImage.caption || currentImage.credit) && (
                <div className="mt-4 text-center max-w-2xl px-4">
                  {currentImage.caption && (
                    <p className="text-white text-sm md:text-base">{currentImage.caption}</p>
                  )}
                  {currentImage.credit && (
                    <p className="text-white/60 text-xs md:text-sm italic mt-1">{currentImage.credit}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="text-white text-sm bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm font-medium">
              {selectedIndex !== null ? selectedIndex + 1 : 1} / {images.length}
            </div>
            
            {/* Thumbnail indicators */}
            <div className="hidden sm:flex items-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx === selectedIndex 
                      ? "bg-white w-6" 
                      : "bg-white/40 hover:bg-white/60"
                  )}
                  onClick={() => {
                    if (selectedIndex !== idx) {
                      // Direct navigation via indicator
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
