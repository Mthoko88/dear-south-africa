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
   const { data: story, error } = await supabase
  .from("stories")
  .select(`
    id,
    title,
    content,
    category,
    user_id,
    created_at,
    view_count,
    is_anonymous,
    location,
    content_warning,
    content_type,
    story_type,
    audio_url,
    cover_image,
    media_urls,
    organisation_id,
    is_published
  `)
  .eq("id", id)
  .maybeSingle()

    if (error || !story) return null

    // AUTHOR (FIXED: user_id, NOT id)
    let author = null
    if (story.user_id) {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url")
        .eq("user_id", story.user_id)
        .maybeSingle()

      author = data
    }

    // ORGANISATION
    let organisation = null
    if (story.organisation_id) {
      const { data } = await supabase
        .from("organisations")
        .select("id, trading_name, logo_url, organisation_type, is_verified")
        .eq("id", story.organisation_id)
        .maybeSingle()

      organisation = data
    }

    return { story, author, organisation }
  } catch (error) {
    console.error("Error fetching story:", error)
    return null
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
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

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await getStory(id)

  if (!result) notFound()

  const { story, author, organisation } = result

  const isVoiceStory = story.story_type === "voice"

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <ViewTracker storyId={story.id} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="space-y-6">

          {(story.cover_image || story.media_urls?.length > 0) && (
            <ImageGallery
              images={story.media_urls || []}
              coverImage={story.cover_image}
            />
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getCategoryColor(story.category)}>
                  {story.category.replace(/-/g, " ")}
                </Badge>

                {story.content_warning && (
                  <Badge variant="destructive">
                    ⚠️ {story.content_warning}
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl md:text-3xl font-bold">
                {story.title}
              </CardTitle>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-3">

                  {organisation ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={organisation.logo_url || ""} />
                        <AvatarFallback>
                          <Building2 className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <Link
                          href={`/organisation/${organisation.id}`}
                          className="font-medium hover:underline flex items-center gap-1"
                        >
                          {organisation.trading_name}

                          {organisation.is_verified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </Link>

                        <p className="text-sm text-muted-foreground">
                          {organisation.organisation_type}
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
                      </div>
                    </>
                  ) : author ? (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={author.avatar_url || ""} />

                        <AvatarFallback>
                          {author.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <Link
                          href={`/profile/${author.username}`}
                          className="font-medium hover:underline"
                        >
                          {author.full_name || author.username}
                        </Link>

                        <p className="text-sm text-muted-foreground">
                          @{author.username}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p>Unknown user</p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {story.view_count || 0}
                </div>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(story.created_at)}
                </div>

                {story.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {story.location}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

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

          <StoryReactions storyId={story.id} />

          <Separator />

          <CommentSection storyId={story.id} />
        </div>
      </div>
    </div>
  )
}
