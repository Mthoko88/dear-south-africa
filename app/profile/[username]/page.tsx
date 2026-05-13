import { notFound, redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, Globe, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StoryCard } from "@/components/story-card"
import { Header } from "@/components/header"

interface Profile {
  id: string
  user_id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  created_at: string
  updated_at: string
}

interface Story {
  id: string
  title: string
  content?: string
  category?: string
  content_warning: string | null
  location: string | null
  upvotes: number
  downvotes?: number
  view_count: number
  is_anonymous: boolean
  created_at: string
  user_id: string
  story_type?: string
  audio_url?: string | null
  cover_image?: string | null

  media_urls?: string[] | null
  organisation_id?: string | null
  source_url?: string | null

  profiles?: {
    username: string
    full_name?: string
    avatar_url?: string
  }

  organisations?: {
    id: string
    trading_name: string
    logo_url?: string | null
    organisation_type: string
    is_verified: boolean
  } | null
}

async function getProfile(username: string) {
  if (!username || username === "undefined") {
    return null
  }

  try {
    // maybeSingle() avoids the "multiple (or no) rows returned" runtime error
    const { data, error } = await supabase.from("profiles").select("*").eq("username", username).limit(1).maybeSingle()

    // If PostgREST still flags an error, treat the "no rows / many rows" case
    // as a graceful miss instead of a hard failure.
    if (error) {
      // Codes that indicate 0 or >1 rows -- see PostgREST error table.
      // PGRST116: no rows,  PGRST118: multiple rows (older),  PGRST125: ambiguous
      const benignCodes = ["PGRST116", "PGRST118", "PGRST125"]
      if (!benignCodes.includes(error.code ?? "")) {
        console.error("Error fetching profile:", error)
      }
      return null
    }

    return data
  } catch (err) {
    console.error("Unexpected error fetching profile:", err)
    return null
  }
}

async function getUserStories(userId: string): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        id,
        title,
        content,
        category,
        content_warning,
        location,
        upvotes,
        downvotes,
        view_count,
        is_anonymous,
        created_at,
        user_id,
        story_type,
        audio_url,
        cover_image,
        media_urls,
        organisation_id,
        source_url,

     
      `)
      .eq("user_id", userId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error) {
      const userIds = [
  ...new Set(
    (data || [])
      .map((story) => story.user_id)
      .filter(Boolean)
  ),
]

const { data: profilesData } = await supabase
  .from("profiles")
  .select(`
    id,
    username,
    full_name,
    avatar_url
  `)
  .in("id", userIds)

const profilesMap = new Map()

profilesData?.forEach((profile) => {
  profilesMap.set(profile.id, profile)
})
      console.error("Error fetching user stories:", error)
      return []
    }

    const storiesWithProfiles = (data || []).map(
  (story) => ({
    ...story,

    profiles:
      profilesMap.get(story.user_id) || {
        username: "anonymous",
        full_name: "Anonymous User",
        avatar_url: null,
      },
  })
)

return storiesWithProfiles

    return data || []
  } catch (error) {
    console.error("Error fetching user stories:", error)
    return []
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

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params

  // If someone lands here with /profile/edit, bounce them to the real edit route.
  if (username === "edit") {
    redirect("/profile/edit")
  }

  if (!username || username === "undefined") {
    notFound()
  }

  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const stories = await getUserStories(profile.user_id)
  const publicStories = stories.filter((story) => !story.is_anonymous)

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{profile.full_name || profile.username}</CardTitle>
                <p className="text-muted-foreground">@{profile.username}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <p className="text-sm">{profile.bio}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-semibold">{publicStories.length}</div>
                    <div className="text-xs text-muted-foreground">Stories</div>
                  </div>
                  <div>
                    <div className="font-semibold">{publicStories.length}</div>
                    <div className="text-xs text-muted-foreground">Published</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stories */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Stories by {profile.full_name || profile.username}</h2>
                {publicStories.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No public stories yet.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Stories shared anonymously won't appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {publicStories.map((story) => (
                     <StoryCard
                        key={story.id}
                        story={story}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
