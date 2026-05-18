"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageGridPreviewProps {
  images: string[]
  coverImage?: string | null
  className?: string
}

function ImageWithLoader({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse" />
      )}
      {hasError ? (
        <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "object-cover w-full h-full transition-all duration-500",
            isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}

export function ImageGridPreview({ images, coverImage, className }: ImageGridPreviewProps) {
  // Combine cover image with media images, avoiding duplicates
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images

  if (allImages.length === 0) return null

  const baseStyles = "rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5"
  const imageContainerStyles = "relative h-full overflow-hidden group"

  // Single image
  if (allImages.length === 1) {
    return (
      <div className={cn("relative aspect-video w-full", baseStyles, className)}>
        <div className={imageContainerStyles}>
          <ImageWithLoader
            src={allImages[0]}
            alt="Story image"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    )
  }

  // 2 images
  if (allImages.length === 2) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 aspect-[2/1]", baseStyles, className)}>
        {allImages.map((img, idx) => (
          <div key={idx} className={imageContainerStyles}>
            <ImageWithLoader
              src={img}
              alt={`Story image ${idx + 1}`}
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    )
  }

  // 3 images
  if (allImages.length === 3) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 aspect-[2/1]", baseStyles, className)}>
        <div className={imageContainerStyles}>
          <ImageWithLoader
            src={allImages[0]}
            alt="Story image 1"
            className="group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="grid grid-rows-2 gap-1 h-full">
          {allImages.slice(1).map((img, idx) => (
            <div key={idx} className={imageContainerStyles}>
              <ImageWithLoader
                src={img}
                alt={`Story image ${idx + 2}`}
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4 images
  if (allImages.length === 4) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 aspect-square", baseStyles, className)}>
        {allImages.map((img, idx) => (
          <div key={idx} className={cn(imageContainerStyles, "aspect-square")}>
            <ImageWithLoader
              src={img}
              alt={`Story image ${idx + 1}`}
              className="group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    )
  }

  // 5+ images - show 4 with count overlay
  return (
    <div className={cn("grid grid-cols-2 gap-1 aspect-square", baseStyles, className)}>
      {allImages.slice(0, 4).map((img, idx) => (
        <div key={idx} className={cn(imageContainerStyles, "aspect-square")}>
          <ImageWithLoader
            src={img}
            alt={`Story image ${idx + 1}`}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          {idx === 3 && allImages.length > 4 ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-white text-xl font-bold drop-shadow-lg">+{allImages.length - 4}</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      ))}
    </div>
  )
}
