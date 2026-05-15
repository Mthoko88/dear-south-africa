"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { CommunityPolls } from "@/components/community-polls"
import { SupportCircles } from "@/components/support-circles"
import { ResourceDirectory } from "@/components/resource-directory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Users, BarChart3, MapPin, Heart, TrendingUp, Award } from "lucide-react"

export default function CommunityPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState({
    communityMembers: 0,
    storiesShared: 0,
    connectionsMade: 0,
    livesImpacted: 0,
  })

  useEffect(() => {
    async function fetchCommunityStats() {
      try {
        const [usersResult, storiesResult, reactionsResult, commentsResult] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("stories").select("*", { count: "exact", head: true }).eq("is_published", true),
          supabase.from("story_reactions").select("*", { count: "exact", head: true }),
          supabase.from("comments").select("*", { count: "exact", head: true }),
        ])

        const totalConnections = (reactionsResult.count || 0) + (commentsResult.count || 0)

        setStats({
          communityMembers: usersResult.count || 0,
          storiesShared: storiesResult.count || 0,
          connectionsMade: totalConnections,
          livesImpacted: Math.floor((storiesResult.count || 0) * 0.8), // Approximate estimate
        })
      } catch (error) {
        console.error("Error fetching community stats:", error)
      }
    }

    fetchCommunityStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Community Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Dear South Africa Community</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect, support, and grow together. Our community is built on shared experiences, mutual support, and the
              belief that every story matters.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{stats.communityMembers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Community Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold">{stats.storiesShared.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Stories Shared</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold">{stats.connectionsMade.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Connections Made</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold">{stats.livesImpacted.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Lives Impacted</div>
              </CardContent>
            </Card>
          </div>

          {/* Community Features */}
          <Tabs defaultValue="circles" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="circles" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Support Circles
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Community Polls
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="circles" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Support Circles</h2>
                <p className="text-muted-foreground">
                  Join intimate groups of people who share similar experiences and challenges
                </p>
              </div>
              <SupportCircles />
            </TabsContent>

            <TabsContent value="polls" className="space-y-6">
              <CommunityPolls />
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Community Resources</h2>
                <p className="text-muted-foreground">
                  Find help, support services, and organizations that can assist you on your journey
                </p>
              </div>
              <ResourceDirectory />
            </TabsContent>
          </Tabs>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Be Kind and Respectful
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Treat every community member with dignity and respect. We're all here to support each other.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Share Authentically
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Your authentic experiences help others feel less alone. Share what feels comfortable for you.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-purple-500" />
                    Maintain Privacy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Respect others' privacy and don't share personal information outside the community.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Support Growth
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Encourage others in their journey and celebrate their progress, no matter how small.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          {!user && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Join Our Community</h3>
                <p className="text-muted-foreground mb-4">
                  Sign up to connect with others, share your story, and access support resources.
                </p>
                <Badge variant="outline" className="text-sm">
                  Free to join • Safe space • Supportive community
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
