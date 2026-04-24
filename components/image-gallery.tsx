"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  coverImage?: string | null
  className?: string
}

export function ImageGallery({ images, coverImage, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  // Combine cover image with media images, avoiding duplicates
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images

  if (allImages.length === 0) return null

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
  }

  const closeLightbox = () => {
    setSelectedIndex(null)
  }

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === allImages.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious()
    if (e.key === "ArrowRight") goToNext()
    if (e.key === "Escape") closeLightbox()
  }

  const GAP = "gap-1" // Consistent gap across all layouts

  // Single image - just show it full width
  if (allImages.length === 1) {
    return (
      <div className={cn("relative", className)}>
        <div 
          className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={allImages[0]}
            alt="Story image"
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
          <DialogContent 
            className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
            onKeyDown={handleKeyDown}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="flex items-center justify-center w-full h-full p-4">
              <img
                src={allImages[0]}
                alt="Story image"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // 2 images - side by side
  if (allImages.length === 2) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn("grid grid-cols-2 rounded-xl overflow-hidden", GAP)}>
          {allImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative cursor-pointer group aspect-square"
              onClick={() => openLightbox(idx)}
            >
              <img
                src={img}
                alt={`Story image ${idx + 1}`}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
        <LightboxDialog 
          images={allImages} 
          selectedIndex={selectedIndex} 
          onClose={closeLightbox} 
          onPrevious={goToPrevious} 
          onNext={goToNext}
          onKeyDown={handleKeyDown}
        />
      </div>
    )
  }

  // 3 images - 1 large + 2 small stacked
  if (allImages.length === 3) {
    return (
      <div className={cn("relative", className)}>
        <div className={cn("grid grid-cols-2 rounded-xl overflow-hidden", GAP)}>
          <div 
            className="relative cursor-pointer group aspect-[3/4]"
            onClick={() => openLightbox(0)}
          >
            <img
              src={allImages[0]}
              alt="Story image 1"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </div>
          <div className={cn("grid grid-rows-2", GAP)}>
            {allImages.slice(1).map((img, idx) => (
              <div 
                key={idx} 
                className="relative cursor-pointer group"
                onClick={() => openLightbox(idx + 1)}
              >
                <img
                  src={img}
                  alt={`Story image ${idx + 2}`}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
        <LightboxDialog 
          images={allImages} 
          selectedIndex={selectedIndex} 
          onClose={closeLightbox} 
          onPrevious={goToPrevious} 
          onNext={goToNext}
          onKeyDown={handleKeyDown}
        />
      </div>
    )
  }

  // 4+ images - 2x2 grid with +N overlay on 4th
  return (
    <div className={cn("relative", className)}>
      <div className={cn("grid grid-cols-2 rounded-xl overflow-hidden", GAP)}>
        {allImages.slice(0, 4).map((img, idx) => (
          <div 
            key={idx} 
            className="relative cursor-pointer group aspect-square"
            onClick={() => openLightbox(idx)}
          >
            <img
              src={img}
              alt={`Story image ${idx + 1}`}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {idx === 3 && allImages.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{allImages.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <LightboxDialog 
        images={allImages} 
        selectedIndex={selectedIndex} 
        onClose={closeLightbox} 
        onPrevious={goToPrevious} 
        onNext={goToNext}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

// Separated lightbox dialog component for reuse
function LightboxDialog({ 
  images, 
  selectedIndex, 
  onClose, 
  onPrevious, 
  onNext,
  onKeyDown 
}: { 
  images: string[]
  selectedIndex: number | null
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}) {
  return (
    <Dialog open={selectedIndex !== null} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
        onKeyDown={onKeyDown}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-50 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={onPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        <div className="flex items-center justify-center w-full h-full p-4">
          {selectedIndex !== null && (
            <img
              src={images[selectedIndex]}
              alt={`Story image ${selectedIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
          )}
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {selectedIndex !== null ? selectedIndex + 1 : 1} / {images.length}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
