import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Eye, Building2, CheckCircle } from "lucide-react"
import { StoryReactions } from "@/components/story-reactions"
import { CommentSection } from "@/components/comment-section"
import { ViewTracker } from "@/components/view-tracker"
import { BackButton } from "@/components/back-button"
import { StoryContentGate } from "@/components/story-content-gate"
import { ImageGallery } from "@/components/image-gallery"
import Link from "next/link"


async function getStory(id: string) {
  try {
    // Fetch story
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle()

    if (storyError || !story) {
      return null
    }

    // Fetch organisation if this is an org post
    let organisation = null
    if (story.organisation_id) {
      const { data: orgData } = await supabase
        .from("organisations")
        .select("id, trading_name, logo_url, organisation_type, is_verified")
        .eq("id", story.organisation_id)
        .maybeSingle()

      organisation = orgData
    }

    // Fetch author profile (only if not an org post)
    let author = null
    if (!organisation && story.user_id && !story.is_anonymous) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", story.user_id)
        .maybeSingle()

      author = profileData
    }

    return { story, author, organisation }
  } catch (error) {
    console.error("Error fetching story:", error)
    return null
  }
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Unknown date"
  }
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    "personal-growth": "bg-green-100 text-green-800",
    relationships: "bg-pink-100 text-pink-800",
    career: "bg-blue-100 text-blue-800",
    health: "bg-red-100 text-red-800",
    family: "bg-purple-100 text-purple-800",
    education: "bg-yellow-100 text-yellow-800",
    "mental-health": "bg-teal-100 text-teal-800",
  }
  return colors[category] || "bg-gray-100 text-gray-800"
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const result = await getStory(params.id)

  if (!result) {
    notFound()
  }

  const { story, author, organisation } = result
  const isVoiceStory = story.story_type === "voice"

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Track unique views */}
      <ViewTracker storyId={story.id} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="space-y-6">
          {/* Image Gallery - shows cover image and/or additional media */}
          {(story.cover_image || (story.media_urls && story.media_urls.length > 0)) && (
            <ImageGallery 
              images={story.media_urls || []} 
              coverImage={story.cover_image}
            />
          )}

          {/* Story Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getCategoryColor(story.category)}>{story.category.replace(/-/g, " ")}</Badge>
                {story.content_warning && (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                    ⚠️ {story.content_warning}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">{story.title}</CardTitle>

              {/* Author Info */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">
                  {organisation ? (
                    <>
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        {organisation.logo_url ? (
                          <AvatarImage src={organisation.logo_url} alt={organisation.trading_name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link 
                          href={`/organisation/${organisation.id}`} 
                          className="font-medium hover:underline flex items-center gap-1.5"
                        >
                          {organisation.trading_name}
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            ORG
                          </Badge>
                          {organisation.is_verified && (
                            <CheckCircle className="h-4 w-4 text-primary fill-primary/20" />
                          )}
                        </Link>
                        <p className="text-sm text-muted-foreground capitalize">
                          {organisation.organisation_type?.replace(/-/g, " ") || "Organisation"}
                        </p>
                      </div>
                    </>
                  ) : story.is_anonymous ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Anonymous</p>
                        <p className="text-sm text-muted-foreground">Shared anonymously</p>
                      </div>
                    </>
                  ) : author ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{author.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/profile/${author.username}`} className="font-medium hover:underline">
                          {author.full_name || author.username}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{author.username}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Unknown User</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{story.view_count || 0}</span>
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(story.created_at)}</span>
                </div>
                {story.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{story.location}</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Story Content */}
          <Card>
            <CardContent className="pt-6">
              <StoryContentGate
                content={story.content || ""}
                audioUrl={story.audio_url}
                isVoiceStory={isVoiceStory}
                previewLength={600}
              />
            </CardContent>
          </Card>

          {/* Story Reactions */}
          <StoryReactions storyId={story.id} />

          <Separator />

          {/* Comments Section */}
          <CommentSection storyId={story.id} />
        </div>
      </div>
    </div>
  )
}
