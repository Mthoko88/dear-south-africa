"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { StoryCard } from "@/components/story-card"
import { CommentSection } from "@/components/comment-section"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function StoryPage() {
  const params = useParams()
  const [story, setStory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchStory()
      incrementViewCount()
    }
  }, [params.id])

  const fetchStory = async () => {
    try {
      // Get the story first
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", params.id)
        .single()

      if (storyError) {
        console.error("Error fetching story:", storyError)
        setLoading(false)
        return
      }

      if (storyData) {
        // Get the author profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", storyData.author_id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
        }

        // Combine story with profile
        const storyWithProfile = {
          ...storyData,
          profiles: profileData || {
            username: "Unknown User",
            full_name: "Unknown User",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        }

        setStory(storyWithProfile)
      }
    } catch (err) {
      console.error("Unexpected error fetching story:", err)
    }

    setLoading(false)
  }

  const incrementViewCount = async () => {
    try {
      // Simple increment without using stored procedure
      const { data: currentStory } = await supabase.from("stories").select("view_count").eq("id", params.id).single()

      if (currentStory) {
        await supabase
          .from("stories")
          .update({ view_count: (currentStory.view_count || 0) + 1 })
          .eq("id", params.id)
      }
    } catch (err) {
      console.error("Error incrementing view count:", err)
    }
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

  if (!story) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Story not found</h1>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
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
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stories
            </Button>
          </Link>

          <div className="bg-white rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-4">{story.title}</h1>
            <div className="prose max-w-none">
              {story.content.split("\n").map((paragraph: string, index: number) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <StoryCard story={story} onUpdate={fetchStory} />

          <div id="comments">
            <CommentSection storyId={story.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
