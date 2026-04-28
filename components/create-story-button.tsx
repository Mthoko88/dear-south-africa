"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Mic } from "lucide-react"
import { CreateStoryModal } from "@/components/create-story-modal"

interface CreateStoryButtonProps {
  onStoryCreated?: () => void
}

export function CreateStoryButton({ onStoryCreated }: CreateStoryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"written" | "voice" | null>(null)

  const handleOpenModal = (type: "written" | "voice") => {
    setSelectedType(type)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedType(null)
  }

  return (
    <>
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-center">Share Your Story</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={() => handleOpenModal("written")} className="h-20 flex flex-col gap-2" variant="outline">
              <Edit className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Write Your Story</div>
                <div className="text-xs text-muted-foreground font-normal">Type out your experience</div>
              </div>
            </Button>

            <Button onClick={() => handleOpenModal("voice")} className="h-20 flex flex-col gap-2" variant="outline">
              <Mic className="h-5 w-5" />
              <div className="text-center">
                <div className="font-semibold">Voice Your Story</div>
                <div className="text-xs text-muted-foreground font-normal">Record your voice note</div>
              </div>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Your story matters. Someone out there needs to hear it.
          </p>
        </CardContent>
      </Card>

      <CreateStoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStoryCreated={onStoryCreated}
        initialStoryType={selectedType}
      />
    </>
  )
}
