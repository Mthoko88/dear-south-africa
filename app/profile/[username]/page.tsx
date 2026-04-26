"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryCard } from "@/components/story-card"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { MapPin, Users, Heart, BookOpen, Edit, MessageCircle, Calendar, Languages, UserCheck } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (params.username) {
      fetchProfile()
      fetchUserStories()
    }
  }, [params.username, user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("username", params.username).single()

      if (data) {
        setProfile(data)
        setIsOwnProfile(user?.id === data.id)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
    setLoading(false)
  }

  const fetchUserStories = async () => {
    try {
      // First get the user ID from username
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", params.username)
        .single()

      if (profileData) {
        const { data: storiesData } = await supabase
          .from("stories")
          .select("*")
          .eq("author_id", profileData.id)
          .order("created_at", { ascending: false })

        if (storiesData) {
          // Add profile info to each story
          const storiesWithProfile = storiesData.map((story) => ({
            ...story,
            profiles: profile,
          }))
          setStories(storiesWithProfile)
        }
      }
    } catch (error) {
      console.error("Error fetching user stories:", error)
    }
  }

  const getUserInitials = (profile: any) => {
    const name = profile?.display_name || profile?.full_name || profile?.username
    if (name) {
      return name
        .split(" ")
        .map((n: string) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return "U"
  }

  const getDisplayName = (profile: any) => {
    if (profile?.use_pseudonym && profile?.pseudonym) {
      return profile.pseudonym
    }
    return profile?.display_name || profile?.full_name || profile?.username || "Anonymous User"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getUserInitials(profile)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{getDisplayName(profile)}</h1>
                      <p className="text-muted-foreground">@{profile.username}</p>
                      {profile.bio && <p className="mt-2 text-lg">{profile.bio}</p>}
                    </div>

                    {isOwnProfile && (
                      <Link href="/profile/edit">
                        <Button className="mt-4 md:mt-0">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    {profile.share_location && (profile.township || profile.province) && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.township && profile.province
                          ? `${profile.township}, ${profile.province}`
                          : profile.township || profile.province}
                      </div>
                    )}

                    {profile.share_age && profile.age_range && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {profile.age_range.replace("-", " - ")}
                      </div>
                    )}

                    {profile.languages && (
                      <div className="flex items-center">
                        <Languages className="h-4 w-4 mr-1" />
                        {profile.languages}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="stories">Stories ({stories.length})</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.share_gender && profile.gender && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span className="capitalize">{profile.gender.replace("-", " ")}</span>
                      </div>
                    )}

                    {profile.occupation && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occupation:</span>
                        <span>{profile.occupation}</span>
                      </div>
                    )}

                    {profile.education_level && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Education:</span>
                        <span className="capitalize">{profile.education_level.replace("-", " ")}</span>
                      </div>
                    )}

                    {profile.relationship_status && profile.relationship_status !== "prefer-not-to-say" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="capitalize">{profile.relationship_status.replace("-", " ")}</span>
                      </div>
                    )}

                    {profile.has_children && profile.has_children !== "prefer-not-to-say" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Children:</span>
                        <span className="capitalize">{profile.has_children}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location & Community */}
                {profile.share_location && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Location & Community
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profile.province && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Province:</span>
                          <span>{profile.province}</span>
                        </div>
                      )}

                      {profile.township && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Township/Area:</span>
                          <span>{profile.township}</span>
                        </div>
                      )}

                      {profile.area_description && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Area:</span>
                          <span>{profile.area_description}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2" />
                      Interests & Passions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Challenges & Help */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.challenges_faced && profile.challenges_faced.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Challenges Faced</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.challenges_faced.map((challenge: string) => (
                          <Badge key={challenge} variant="outline">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile.willing_to_help_with && profile.willing_to_help_with.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Willing to Help With</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.willing_to_help_with.map((help: string) => (
                          <Badge key={help} variant="default">
                            {help}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stories" className="space-y-4">
              {stories.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile
                        ? "Share your first story with the community!"
                        : "This user hasn't shared any stories yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stories.map((story) => <StoryCard key={story.id} story={story} />)
              )}
            </TabsContent>

            <TabsContent value="connections" className="space-y-4">
              <Card>
                <CardContent className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Connections</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with others who share similar experiences and interests.
                  </p>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Find Connections
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
