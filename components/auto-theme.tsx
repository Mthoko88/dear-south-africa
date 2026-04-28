"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function AutoTheme() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const checkTimeAndSetTheme = () => {
      const hour = new Date().getHours()

      // Dark mode between 6pm (18:00) and 6am (06:00)
      if (hour >= 18 || hour < 6) {
        setTheme("dark")
      } else {
        setTheme("light")
      }
    }

    // Check immediately on mount
    checkTimeAndSetTheme()

    // Check every minute to catch the transition times
    const interval = setInterval(checkTimeAndSetTheme, 60000)

    return () => clearInterval(interval)
  }, [setTheme])

  return null
}
