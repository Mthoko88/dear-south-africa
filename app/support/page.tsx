"use client"

import { Header } from "@/components/header"
import { ResourceDirectory } from "@/components/resource-directory"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Title */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Support & Resources</h1>
          <p className="text-sm text-muted-foreground">Find help and support services across South Africa</p>
        </div>
      </div>

      {/* Resource Directory Content */}
      <div className="container mx-auto px-4 py-6">
        <ResourceDirectory />
      </div>
    </div>
  )
}
