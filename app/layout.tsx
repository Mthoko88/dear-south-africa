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
  title: "Dear South Africa - Share Your Story",
  description: "A community platform for South Africans to share their stories, connect, and heal together.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
    generator: 'v0.app'
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
