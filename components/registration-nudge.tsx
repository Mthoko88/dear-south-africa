"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { Button } from "@/components/ui/button"
import { X, Heart, PenLine, MessageCircle } from "lucide-react"

const STORAGE_KEY = "dearsa_nudge"
const PAGES_BEFORE_FIRST_NUDGE = 3
const PAGES_BETWEEN_NUDGES = 5
const MAX_DISMISSALS_PER_DAY = 3
const COOLDOWN_AFTER_DISMISS_MS = 1000 * 60 * 60 // 1 hour cooldown after dismiss
const AUTO_HIDE_MS = 15000

interface NudgeData {
  pageViews: number
  lastShownAtPageView: number
  dismissCount: number
  lastDismissedAt: number
}

function getStoredData(): NudgeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { pageViews: 0, lastShownAtPageView: 0, dismissCount: 0, lastDismissedAt: 0 }
}

function saveData(data: NudgeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

const nudgeMessages = [
  {
    icon: Heart,
    title: "Enjoying these stories?",
    description: "Create a free account to share your own story and connect with the community.",
  },
  {
    icon: PenLine,
    title: "You have a story too",
    description: "Join Dear South Africa and share your experience. Your voice matters.",
  },
  {
    icon: MessageCircle,
    title: "Want to join the conversation?",
    description: "Sign up to comment on stories, bookmark your favourites, and more.",
  },
]

export function RegistrationNudge() {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signup")
  const [messageIndex, setMessageIndex] = useState(0)
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasProcessedPath = useRef<string | null>(null)

  // Track page views on every route change
  useEffect(() => {
    // Don't do anything if logged in or still loading auth
    if (loading || user) return

    // Prevent double-processing the same path
    if (hasProcessedPath.current === pathname) return
    hasProcessedPath.current = pathname

    const data = getStoredData()

    // Reset dismiss count if it's a new day
    const now = Date.now()
    const lastDismissDate = new Date(data.lastDismissedAt).toDateString()
    const todayDate = new Date(now).toDateString()
    if (lastDismissDate !== todayDate) {
      data.dismissCount = 0
    }

    // Increment page view
    data.pageViews += 1
    saveData(data)

    // Check if we've hit the max dismissals for today
    if (data.dismissCount >= MAX_DISMISSALS_PER_DAY) {
      return
    }

    // Check cooldown after dismiss
    if (data.lastDismissedAt > 0) {
      const timeSinceDismiss = now - data.lastDismissedAt
      if (timeSinceDismiss < COOLDOWN_AFTER_DISMISS_MS) {
        return
      }
    }

    // Determine if we should show the nudge
    let shouldShow = false

    if (data.lastShownAtPageView === 0 && data.pageViews >= PAGES_BEFORE_FIRST_NUDGE) {
      // First time showing - after N page views
      shouldShow = true
    } else if (data.lastShownAtPageView > 0) {
      // Subsequent shows - every N pages since last shown
      const pagesSinceLastShow = data.pageViews - data.lastShownAtPageView
      if (pagesSinceLastShow >= PAGES_BETWEEN_NUDGES) {
        shouldShow = true
      }
    }

    if (shouldShow) {
      // Pick a message based on total views to rotate through them
      setMessageIndex(data.pageViews % nudgeMessages.length)

      // Update last shown
      data.lastShownAtPageView = data.pageViews
      saveData(data)

      // Show after a short delay so it doesn't flash immediately
      setTimeout(() => {
        setVisible(true)
      }, 2500)
    }
  }, [pathname, user, loading])

  // Auto-hide timer
  useEffect(() => {
    if (!visible) {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current)
      return
    }

    autoHideTimer.current = setTimeout(() => {
      setVisible(false)
    }, AUTO_HIDE_MS)

    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current)
    }
  }, [visible])

  // Hide immediately if user logs in
  useEffect(() => {
    if (user) setVisible(false)
  }, [user])

  // Don't render anything if logged in
  if (user || loading) return null

  const currentMessage = nudgeMessages[messageIndex]
  const Icon = currentMessage.icon

  const handleDismiss = () => {
    setVisible(false)
    const data = getStoredData()
    data.dismissCount += 1
    data.lastDismissedAt = Date.now()
    saveData(data)
  }

  const handleSignUp = () => {
    setAuthModalTab("signup")
    setAuthModalOpen(true)
    setVisible(false)
  }

  const handleSignIn = () => {
    setAuthModalTab("signin")
    setAuthModalOpen(true)
    setVisible(false)
  }

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        } pointer-events-none`}
      >
        <div className="mx-auto max-w-lg p-4 pb-6 pointer-events-auto">
          <div className="relative bg-card border border-border rounded-xl shadow-lg p-5">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">
                  {currentMessage.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentMessage.description}
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" onClick={handleSignUp} className="text-xs h-8">
                    Sign Up Free
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignIn}
                    className="text-xs h-8 text-muted-foreground"
                  >
                    Log In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  )
}
