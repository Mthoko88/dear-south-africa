import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GoogleAnalytics } from "@/components/google-analytics"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { RegistrationNudge } from "@/components/registration-nudge"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoTheme } from "@/components/auto-theme"
import { CookieConsent } from "@/components/cookie-consent"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dear SA - Share Your Story",
  description: "A community platform for South Africans to share their stories, connect, and heal together.",
  applicationName: "Dear SA",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Dear SA",
    statusBarStyle: "default",
  },
    generator: 'v0.app'
}

export const viewport = {
  themeColor: "#e11d2a",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AutoTheme />
          <AuthProvider>
            {children}
            <RegistrationNudge />
            <Toaster />
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
