"use client"

import { useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"

// Storage key for viewed stories - using session-based key to track per session
const VIEWED_STORIES_KEY = "dearsa_viewed_stories_v3"

// Get viewed stories from sessionStorage (resets each browser session)
function getViewedStories(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const stored = sessionStorage.getItem(VIEWED_STORIES_KEY)
    return new Set(stored ? JSON.parse(stored) : [])
  } catch {
    return new Set()
  }
}

// Save viewed stories to sessionStorage
function saveViewedStories(stories: Set<string>): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...stories]))
  } catch {
    // sessionStorage might be disabled
  }
}

// Mark story as viewed in this session
function markStoryAsViewed(storyId: string): boolean {
  const viewedStories = getViewedStories()
  if (viewedStories.has(storyId)) {
    return false // Already viewed in this session
  }
  viewedStories.add(storyId)
  saveViewedStories(viewedStories)
  return true // New view
}

interface ViewTrackerProps {
  storyId: string
}

export function ViewTracker({ storyId }: ViewTrackerProps) {
  const hasRun = useRef(false)

  useEffect(() => {
    // Strict check - only run once ever for this component instance
    if (hasRun.current) return
    hasRun.current = true

    // Check and mark in sessionStorage FIRST (synchronous)
    // This returns false if already viewed in this session
    const isNewView = markStoryAsViewed(storyId)
    
    if (!isNewView) {
      // Already viewed in this session, don't increment
      return
    }

    // Only increment if this is a genuinely new view
    const incrementView = async () => {
      if (!supabase) return
      
      try {
        // Try the RPC function first
        const { error: rpcError } = await supabase.rpc("increment_story_view_count", {
          story_id: storyId
        })
        
        if (rpcError) {
          // Fallback: direct update
          const { data: story, error: fetchError } = await supabase
            .from("stories")
            .select("view_count")
            .eq("id", storyId)
            .single()
          
          if (fetchError) {
            return
          }
          
          if (story) {
            await supabase
              .from("stories")
              .update({ view_count: (story.view_count || 0) + 1 })
              .eq("id", storyId)
          }
        }
      } catch {
        // Silently fail
      }
    }

    // Run the increment
    incrementView()
  }, [storyId])

  return null
}
