"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { StoryFeed } from "@/components/story-feed"
import { CreateStoryButton } from "@/components/create-story-button"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleStoryCreated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Sidebar />
          </aside>
          <main className="lg:col-span-3">
            <div className="space-y-6">
              <CreateStoryButton onStoryCreated={handleStoryCreated} />
              <StoryFeed key={refreshKey} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
