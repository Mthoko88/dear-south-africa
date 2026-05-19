"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { EnhancedStoryFeed } from "@/components/enhanced-story-feed"
import { CreateStoryButton } from "@/components/create-story-button"
import { StoryRecommendations } from "@/components/story-recommendations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, TrendingUp, Users, Heart } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle OAuth callback if code is present in URL
  useEffect(() => {
    const code = searchParams.get("code")
    
    if (code) {
      const supabase = createClient()
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Error exchanging code for session:", error)
        }
        // Remove the code from URL and force a full page reload to sync auth state
        window.location.href = "/"
      })
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex justify-center">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl">
          {/* Welcome Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome to Dear South Africa</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A safe space where ordinary South Africans share their stories, connect with others, and find healing
              through community support.
            </p>

            <div className="pt-4">
              <CreateStoryButton />
              <p className="text-sm text-muted-foreground mt-2">
                Share your story and help someone else feel less alone
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="stories" className="w-full">
            <TabsList className="w-full flex h-9">
              <TabsTrigger value="stories" className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs px-1 sm:px-3 h-7">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs px-1 sm:px-3 h-7">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Trending</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs px-1 sm:px-3 h-7">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Community</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex-1 flex items-center justify-center gap-1 text-[10px] sm:text-xs px-1 sm:px-3 h-7">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Support</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnhancedStoryFeed />
                </div>
                <div className="hidden lg:block">
                  <StoryRecommendations />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <EnhancedStoryFeed />
                </div>
                <div className="hidden lg:block">
                  <StoryRecommendations />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Community features coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Support resources coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
