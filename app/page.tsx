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
        

          {/* Main Content */}
         
        </main>
      </div>
    </div>
  )
}
