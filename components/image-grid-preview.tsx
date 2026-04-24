"use client"

import { cn } from "@/lib/utils"

interface ImageGridPreviewProps {
  images: string[]
  coverImage?: string | null
  className?: string
}

export function ImageGridPreview({ images, coverImage, className }: ImageGridPreviewProps) {
  // Combine cover image with media images, avoiding duplicates
  const allImages = coverImage 
    ? [coverImage, ...images.filter(img => img !== coverImage)]
    : images

  if (allImages.length === 0) return null

  // Single image
  if (allImages.length === 1) {
    return (
      <div className={cn("relative aspect-video w-full rounded-lg overflow-hidden", className)}>
        <img
          src={allImages[0]}
          alt="Story image"
          className="object-cover w-full h-full"
        />
      </div>
    )
  }

  // 2 images
  if (allImages.length === 2) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-[2/1]", className)}>
        {allImages.map((img, idx) => (
          <div key={idx} className="relative h-full">
            <img
              src={img}
              alt={`Story image ${idx + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
    )
  }

  // 3 images
  if (allImages.length === 3) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-[2/1]", className)}>
        <div className="relative h-full">
          <img
            src={allImages[0]}
            alt="Story image 1"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="grid grid-rows-2 gap-1 h-full">
          {allImages.slice(1).map((img, idx) => (
            <div key={idx} className="relative h-full">
              <img
                src={img}
                alt={`Story image ${idx + 2}`}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 4 images
  if (allImages.length === 4) {
    return (
      <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-square", className)}>
        {allImages.map((img, idx) => (
          <div key={idx} className="relative">
            <img
              src={img}
              alt={`Story image ${idx + 1}`}
              className="object-cover w-full h-full aspect-square"
            />
          </div>
        ))}
      </div>
    )
  }

  // 5+ images - show 4 with count overlay
  return (
    <div className={cn("grid grid-cols-2 gap-1 rounded-lg overflow-hidden aspect-square", className)}>
      {allImages.slice(0, 4).map((img, idx) => (
        <div key={idx} className="relative">
          <img
            src={img}
            alt={`Story image ${idx + 1}`}
            className="object-cover w-full h-full aspect-square"
          />
          {idx === 3 && allImages.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xl font-bold">+{allImages.length - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
