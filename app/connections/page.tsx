"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import {
  MapPin,
  Users,
  Search,
  MessageCircle,
  Calendar,
  Languages,
  Briefcase,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

const provinces = [
  "All Provinces",
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

const ageRanges = ["All Ages", "under-18", "18-24", "25-34", "35-44", "45-54", "55-64", "65-plus"]

interface ConnectionUser {
  id: string
  username: string
  display_name: string
  full_name: string
  use_pseudonym: boolean
  pseudonym: string
  bio: string
  avatar_url: string
  age_range: string
  gender: string
  province: string
  township: string
  interests: string[]
  challenges_faced: string[]
  willing_to_help_with: string[]
  languages: string
  occupation: string
  education_level: string
  share_location: boolean
  share_age: boolean
  share_gender: boolean
  looking_for_connections: boolean
  similarity_score?: number
  connection_reasons?: string[]
}

export default function ConnectionsPage() {
  const { user, profile } = useAuth()
  const [connections, setConnections] = useState<ConnectionUser[]>([])
  const [filteredConnections, setFilteredConnections] = useState<ConnectionUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("All Provinces")
  const [selectedAge, setSelectedAge] = useState("All Ages")
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    if (user) {
      fetchConnections()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [connections, searchQuery, selectedProvince, selectedAge, selectedFilter])

  const fetchConnections = async () => {
    setLoading(true)

    try {
      // Get all users who are looking for connections (excluding current user)
      const { data: users, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("looking_for_connections", true)
        .neq("id", user?.id)

      if (error) {
        console.error("Error fetching connections:", error)
        return
      }

      if (users) {
        // Calculate similarity scores and connection reasons
        const connectionsWithScores = users.map((connectionUser) => {
          const similarity = calculateSimilarity(profile, connectionUser)
          return {
            ...connectionUser,
            similarity_score: similarity.score,
            connection_reasons: similarity.reasons,
          }
        })

        // Sort by similarity score (highest first)
        connectionsWithScores.sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))

        setConnections(connectionsWithScores)
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
    }

    setLoading(false)
  }

  const calculateSimilarity = (userProfile: any, otherProfile: any) => {
    let score = 0
    const reasons: string[] = []

    if (!userProfile) return { score: 0, reasons: [] }

    // Location similarity (highest weight)
    if (userProfile.province === otherProfile.province) {
      score += 30
      reasons.push(`Both from ${userProfile.province}`)

      if (userProfile.township === otherProfile.township) {
        score += 20
        reasons.push(`Both from ${userProfile.township}`)
      }
    }

    // Age similarity
    if (userProfile.age_range === otherProfile.age_range) {
      score += 15
      reasons.push("Similar age group")
    }

    // Shared interests
    const sharedInterests =
      userProfile.interests?.filter((interest: string) => otherProfile.interests?.includes(interest)) || []

    if (sharedInterests.length > 0) {
      score += sharedInterests.length * 10
      reasons.push(
        `Shared interests: ${sharedInterests.slice(0, 3).join(", ")}${sharedInterests.length > 3 ? "..." : ""}`,
      )
    }

    // Shared challenges
    const sharedChallenges =
      userProfile.challenges_faced?.filter((challenge: string) => otherProfile.challenges_faced?.includes(challenge)) ||
      []

    if (sharedChallenges.length > 0) {
      score += sharedChallenges.length * 15
      reasons.push(
        `Similar experiences: ${sharedChallenges.slice(0, 2).join(", ")}${sharedChallenges.length > 2 ? "..." : ""}`,
      )
    }

    // Help matching (user can help with other's challenges)
    const canHelp =
      userProfile.willing_to_help_with?.filter((help: string) => otherProfile.challenges_faced?.includes(help)) || []

    if (canHelp.length > 0) {
      score += canHelp.length * 12
      reasons.push(`You can help with: ${canHelp.slice(0, 2).join(", ")}`)
    }

    // Other can help user
    const canReceiveHelp =
      otherProfile.willing_to_help_with?.filter((help: string) => userProfile.challenges_faced?.includes(help)) || []

    if (canReceiveHelp.length > 0) {
      score += canReceiveHelp.length * 12
      reasons.push(`They can help with: ${canReceiveHelp.slice(0, 2).join(", ")}`)
    }

    // Gender similarity (lower weight)
    if (userProfile.gender === otherProfile.gender && userProfile.gender !== "prefer-not-to-say") {
      score += 5
      reasons.push("Same gender identity")
    }

    // Education level similarity
    if (userProfile.education_level === otherProfile.education_level) {
      score += 8
      reasons.push("Similar education background")
    }

    return { score, reasons }
  }

  const applyFilters = () => {
    let filtered = [...connections]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          getDisplayName(user).toLowerCase().includes(query) ||
          user.bio?.toLowerCase().includes(query) ||
          user.occupation?.toLowerCase().includes(query) ||
          user.interests?.some((interest) => interest.toLowerCase().includes(query)) ||
          user.challenges_faced?.some((challenge) => challenge.toLowerCase().includes(query)),
      )
    }

    // Province filter
    if (selectedProvince !== "All Provinces") {
      filtered = filtered.filter((user) => user.province === selectedProvince)
    }

    // Age filter
    if (selectedAge !== "All Ages") {
      filtered = filtered.filter((user) => user.age_range === selectedAge)
    }

    // Connection type filter
    switch (selectedFilter) {
      case "nearby":
        filtered = filtered.filter((user) => user.province === profile?.province || user.township === profile?.township)
        break
      case "similar-interests":
        filtered = filtered.filter((user) => user.interests?.some((interest) => profile?.interests?.includes(interest)))
        break
      case "similar-challenges":
        filtered = filtered.filter((user) =>
          user.challenges_faced?.some((challenge) => profile?.challenges_faced?.includes(challenge)),
        )
        break
      case "can-help":
        filtered = filtered.filter((user) =>
          profile?.willing_to_help_with?.some((help) => user.challenges_faced?.includes(help)),
        )
        break
      case "can-help-me":
        filtered = filtered.filter((user) =>
          user.willing_to_help_with?.some((help) => profile?.challenges_faced?.includes(help)),
        )
        break
    }

    setFilteredConnections(filtered)
  }

  const getDisplayName = (user: ConnectionUser) => {
    if (user.use_pseudonym && user.pseudonym) {
      return user.pseudonym
    }
    return user.display_name || user.full_name || user.username || "Anonymous User"
  }

  const getUserInitials = (user: ConnectionUser) => {
    const name = getDisplayName(user)
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const ConnectionCard = ({ user }: { user: ConnectionUser }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{getDisplayName(user)}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              <div className="flex items-center space-x-2">
                {user.similarity_score && user.similarity_score > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(user.similarity_score)}% match
                  </Badge>
                )}
              </div>
            </div>

            {user.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{user.bio}</p>}

            {/* Connection Info */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
              {user.share_location && (user.township || user.province) && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {user.township && user.province
                    ? `${user.township}, ${user.province}`
                    : user.township || user.province}
                </div>
              )}

              {user.share_age && user.age_range && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {user.age_range.replace("-", " - ")}
                </div>
              )}

              {user.languages && (
                <div className="flex items-center">
                  <Languages className="h-3 w-3 mr-1" />
                  {user.languages}
                </div>
              )}

              {user.occupation && (
                <div className="flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {user.occupation}
                </div>
              )}
            </div>

            {/* Connection Reasons */}
            {user.connection_reasons && user.connection_reasons.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Why you might connect:</p>
                <div className="flex flex-wrap gap-1">
                  {user.connection_reasons.slice(0, 3).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interests Preview */}
            {user.interests && user.interests.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {user.interests.slice(0, 4).map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {user.interests.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{user.interests.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <Button size="sm" asChild>
                <Link href={`/profile/${user.username}`}>
                  <Users className="h-3 w-3 mr-1" />
                  View Profile
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground">Please sign in to find and connect with community members.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Find Your Community</h1>
            <p className="text-muted-foreground">
              Connect with others who share your experiences, interests, and can offer support.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, interests, occupation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age === "All Ages" ? age : age.replace("-", " - ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={fetchConnections} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Connection Type Tabs */}
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="nearby">Nearby</TabsTrigger>
              <TabsTrigger value="similar-interests">Interests</TabsTrigger>
              <TabsTrigger value="similar-challenges">Experiences</TabsTrigger>
              <TabsTrigger value="can-help">I Can Help</TabsTrigger>
              <TabsTrigger value="can-help-me">Can Help Me</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse flex space-x-4">
                      <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No connections found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or{" "}
                  <Link href="/profile/edit" className="text-primary hover:underline">
                    complete your profile
                  </Link>{" "}
                  to find better matches.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedProvince("All Provinces")
                    setSelectedAge("All Ages")
                    setSelectedFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Found {filteredConnections.length} potential connection{filteredConnections.length !== 1 ? "s" : ""}
                </p>
              </div>

              {filteredConnections.map((user) => (
                <ConnectionCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
