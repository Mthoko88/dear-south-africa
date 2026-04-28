"use client"

import { Header } from "@/components/header"
import { DiaryDashboard } from "@/components/diary-dashboard"

export default function DiaryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <DiaryDashboard />
      </div>
    </div>
  )
}
