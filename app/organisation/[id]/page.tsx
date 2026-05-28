"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoryCard } from "@/components/story-card"
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Users,
  CheckCircle,
  ExternalLink,
  Loader2
} from "lucide-react"
import { Header } from "@/components/header"
import { OrganisationFollowButton } from "@/components/organisation-follow-button"

interface Organisation {
  id: string
  registered_name: string
  trading_name: string
  organisation_type: string
  registration_number: string | null
  description: string
  mission_statement: string | null
  logo_url: string | null
  cover_image_url: string | null
  website: string | null
  email: string
  phone: string | null
  physical_address: string | null
  city: string | null
  province: string | null
  focus_areas: string[] | null
  beneficiary_demographics: any | null
  beneficiary_locations: string[] | null
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  linkedin_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  is_verified: boolean
  created_at: string
}

interface Story {
  id: string
  title: string
  content: string
  category: string
  cover_image: string | null
  media_urls?: string[] | null
  created_at: string
  is_anonymous: boolean
  upvotes: number
  downvotes: number
  user_id: string
  view_count?: number
  audio_url?: string | null
  story_type?: string
  location?: string | null
  content_warning?: string | null
  organisation_id?: string | null
  source_url?: string | null
  profiles?: {
    user_id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  organisations?: {
    id: string
    trading_name: string
    logo_url: string | null
    organisation_type: string
    is_verified: boolean
  } | null
}

const ORGANISATION_TYPE_LABELS: Record<string, string> = {
  admin: "Platform Administrator",
  ngo: "NGO",
  npo: "NPO",
  cbo: "Community-Based Organisation",
  csi: "Corporate Social Investment",
  faith: "Faith-Based Organisation",
  foundation: "Foundation",
  trust: "Trust",
  cooperative: "Cooperative",
  social_enterprise: "Social Enterprise",
  other: "Organisation",
}

export default function OrganisationProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function fetchOrganisation() {
      if (!params.id) return

      try {
        // Fetch organisation
        const { data: org, error: orgError } = await supabase
          .from("organisations")
          .select("*")
          .eq("id", params.id)
          .single()

        if (orgError) throw orgError
        setOrganisation(org)

        // Fetch stories by this organisation
        const { data: orgStories, error: storiesError } = await supabase
          .from("stories")
          .select(`
            id,
            title,
            content,
            category,
            cover_image,
            media_urls,
            created_at,
            is_anonymous,
            upvotes,
            downvotes,
            user_id,
            view_count,
            audio_url,
            story_type,
            location,
            content_warning,
            organisation_id,
            source_url,
            profiles:user_id (
              user_id,
              username,
              full_name,
              avatar_url
            ),
            organisations:organisation_id (
              id,
              trading_name,
              logo_url,
              organisation_type,
              is_verified
            )
          `)
          .eq("organisation_id", params.id)
          .eq("is_published", true)
          .order("created_at", { ascending: false })

        if (!storiesError && orgStories) {
          setStories(orgStories as Story[])
        }

        // Check if current user is admin of this org
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("organisation_id, is_admin")
            .eq("user_id", user.id)
            .single()

          if (profile && profile.organisation_id === params.id && profile.is_admin) {
            setIsAdmin(true)
          }
        }
      } catch (error) {
        console.error("Error fetching organisation:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganisation()
  }, [params.id, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!organisation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Organisation Not Found</CardTitle>
            <CardDescription>
              The organisation you&apos;re looking for doesn&apos;t exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      {/* Organisation Info Header */}
      <div className="bg-background border-b">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stories
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="shrink-0">
              {organisation.logo_url ? (
                <img
                  src={organisation.logo_url}
                  alt={organisation.trading_name}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain rounded-xl border bg-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl border bg-muted flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{organisation.trading_name}</h1>
                    {organisation.is_verified && (
                      <CheckCircle className="h-6 w-6 text-primary fill-primary/20" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <Badge variant="secondary">
                      {ORGANISATION_TYPE_LABELS[organisation.organisation_type] || organisation.organisation_type}
                    </Badge>
                    {organisation.registration_number && (
                      <span className="text-sm">Reg: {organisation.registration_number}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/organisation/${organisation.id}/edit`}>
                        Edit Profile
                      </Link>
                    </Button>
                  )}
                  <OrganisationFollowButton 
                    organisationId={organisation.id} 
                    size="sm"
                    showCount
                  />
                </div>
              </div>

              <p className="mt-4 text-muted-foreground">{organisation.description}</p>

              {/* Focus areas */}
              {organisation.focus_areas && organisation.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-4">
                  {organisation.focus_areas.map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick contact */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                {organisation.city && organisation.province && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {organisation.city}, {organisation.province}
                  </span>
                )}
                {organisation.website && (
                  <a
                    href={organisation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stories">Stories ({stories.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            {stories.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No stories yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {organisation.trading_name} hasn&apos;t shared any stories yet. Check back soon!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <div key={story.id} className="min-w-0">
                    <StoryCard
                      story={{
                        ...story,
                        organisations: {
                          id: organisation.id,
                          trading_name: organisation.trading_name,
                          logo_url: organisation.logo_url,
                          organisation_type: organisation.organisation_type,
                          is_verified: organisation.is_verified
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>About {organisation.trading_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{organisation.description}</p>
                  </div>

                  {organisation.mission_statement && (
                    <div>
                      <h4 className="font-medium mb-2">Mission Statement</h4>
                      <p className="text-muted-foreground italic">&quot;{organisation.mission_statement}&quot;</p>
                    </div>
                  )}

                  {organisation.beneficiary_demographics && (
                    <div>
                      <h4 className="font-medium mb-2">Who We Serve</h4>
                      <p className="text-muted-foreground">
                        {typeof organisation.beneficiary_demographics === 'string' 
                          ? organisation.beneficiary_demographics 
                          : JSON.stringify(organisation.beneficiary_demographics)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {organisation.focus_areas && organisation.focus_areas.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Areas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {organisation.focus_areas.map((area) => (
                        <Badge key={area} className="text-sm py-1 px-3">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${organisation.email}`} className="text-primary hover:underline">
                      {organisation.email}
                    </a>
                  </div>

                  {organisation.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a href={`tel:${organisation.phone}`} className="hover:underline">
                        {organisation.phone}
                      </a>
                    </div>
                  )}

                  {organisation.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={organisation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {organisation.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {(organisation.physical_address || organisation.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        {organisation.physical_address && <p>{organisation.physical_address}</p>}
                        {organisation.city && organisation.province && (
                          <p>{organisation.city}, {organisation.province}</p>
                        )}
                        
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {organisation.facebook_url && (
                    <a
                      href={organisation.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                      <span>Facebook</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                    </a>
                  )}

                  {organisation.instagram_url && (
                    <a
                      href={organisation.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Instagram className="h-5 w-5 text-[#E4405F]" />
                      <span>Instagram</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                    </a>
                  )}

                  {organisation.twitter_url && (
                    <a
                      href={organisation.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                      <span>X (Twitter)</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                    </a>
                  )}

                  {organisation.linkedin_url && (
                    <a
                      href={organisation.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Linkedin className="h-5 w-5 text-[#0A66C2]" />
                      <span>LinkedIn</span>
                      <ExternalLink className="h-4 w-4 ml-auto text-muted-foreground" />
                    </a>
                  )}

                  {!organisation.facebook_url && 
                   !organisation.instagram_url && 
                   !organisation.twitter_url && 
                   !organisation.linkedin_url && (
                    <p className="text-muted-foreground text-center py-4">
                      No social media profiles listed
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
