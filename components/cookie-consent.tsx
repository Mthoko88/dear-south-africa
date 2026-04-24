"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Cookie, Settings, X } from "lucide-react"

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = "dearsa_cookie_consent"
const COOKIE_PREFERENCES_KEY = "dearsa_cookie_preferences"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!hasConsented) {
      // Delay showing banner slightly for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    setPreferences(allAccepted)
    saveConsent(allAccepted)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly = { necessary: true, analytics: false, marketing: false }
    setPreferences(necessaryOnly)
    saveConsent(necessaryOnly)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
  }

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setShowBanner(false)
    setShowSettings(false)

    // Dispatch event for analytics to listen to
    window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-2xl mx-auto shadow-lg border-2">
        <CardContent className="p-4 md:p-6">
          {!showSettings ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">We Value Your Privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    In compliance with South Africa&apos;s Protection of Personal Information Act (POPIA), 
                    we need your consent to use cookies. We use cookies to enhance your experience, 
                    analyze site traffic, and for marketing purposes.{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Read our Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Preferences
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleAcceptNecessary}>
                    Necessary Only
                  </Button>
                  <Button size="sm" onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="font-medium">Necessary Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Required for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="font-medium">Analytics Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how visitors use our website.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, analytics: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="font-medium">Marketing Cookies</Label>
                    <p className="text-xs text-muted-foreground">
                      Used to deliver personalized content and ads.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((prev) => ({ ...prev, marketing: checked }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
