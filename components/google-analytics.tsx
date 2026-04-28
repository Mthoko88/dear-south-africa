"use client"

import { useEffect } from "react"

interface GoogleAnalyticsProps {
  gaId: string
}

export function GoogleAnalyticsClient({ gaId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Only run on client after hydration
    if (typeof window === "undefined" || !gaId) return

    // Check if already loaded
    if (window.gtag) return

    // Load the gtag script
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag
    gtag("js", new Date())
    gtag("config", gaId)
  }, [gaId])

  return null
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
