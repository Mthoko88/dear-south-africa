"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Mic, Link2, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StoryTypeSelectorProps {
  open: boolean
  onClose: () => void
  onSelectType: (type: "written" | "voice" | "link") => void
  isOrganisationUser?: boolean
  organisationName?: string
}

export function StoryTypeSelector({ 
  open, 
  onClose, 
  onSelectType,
  isOrganisationUser = false,
  organisationName
}: StoryTypeSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isOrganisationUser 
              ? "What did your organisation get up to today?"
              : "How would you like to share your story?"
            }
          </DialogTitle>
          {isOrganisationUser && organisationName && (
            <DialogDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Posting as <span className="font-medium">{organisationName}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            onClick={() => onSelectType("written")}
            className="h-auto py-5 flex flex-col gap-2 text-lg"
            variant="outline"
          >
            <Edit className="h-7 w-7" />
            <div className="text-center">
              <div className="font-semibold">
                {isOrganisationUser ? "Write a Post" : "Write Your Story"}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {isOrganisationUser 
                  ? "Share updates, news, or stories from your organisation"
                  : "Type out your thoughts and experiences"
                }
              </div>
            </div>
          </Button>

          <Button 
            onClick={() => onSelectType("voice")} 
            className="h-auto py-5 flex flex-col gap-2 text-lg" 
            variant="outline"
          >
            <Mic className="h-7 w-7" />
            <div className="text-center">
              <div className="font-semibold">
                {isOrganisationUser ? "Record a Message" : "Voice Your Story"}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {isOrganisationUser
                  ? "Record a voice update or message"
                  : "Record your story as a voice note"
                }
              </div>
            </div>
          </Button>

          {isOrganisationUser && (
            <Button 
              onClick={() => onSelectType("link")} 
              className="h-auto py-5 flex flex-col gap-2 text-lg relative" 
              variant="outline"
            >
              <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                NGO/CSI
              </Badge>
              <Link2 className="h-7 w-7" />
              <div className="text-center">
                <div className="font-semibold">Import from Link</div>
                <div className="text-sm text-muted-foreground font-normal">
                  Share an article from another platform with your community
                </div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
