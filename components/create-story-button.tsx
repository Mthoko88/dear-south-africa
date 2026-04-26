"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PenTool, Plus } from "lucide-react"
import { CreateStoryModal } from "@/components/create-story-modal"

interface CreateStoryButtonProps {
  onStoryCreated?: () => void
}

export function CreateStoryButton({ onStoryCreated }: CreateStoryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <Button onClick={() => setIsModalOpen(true)} className="w-full h-16 text-lg" variant="ghost">
            <div className="flex items-center space-x-3">
              <PenTool className="h-6 w-6" />
              <span>Share Your Story</span>
              <Plus className="h-5 w-5" />
            </div>
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Your story matters. Someone out there needs to hear it.
          </p>
        </CardContent>
      </Card>

      <CreateStoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onStoryCreated={onStoryCreated} />
    </>
  )
}
