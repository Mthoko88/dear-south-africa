"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface Profile {
  id: string
  user_id: string
  username: string
  full_name?: string
  avatar_url?: string
  bio?: string
  location?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!isSupabaseConfigured) {
      return null
    }
    
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle()

      if (error) {
        // Only log non-network errors
        if (!error.message?.includes("fetch")) {
          console.error("[v0] Error fetching profile:", error.message)
        }
        return null
      }

      return data
    } catch (error) {
      // Silently handle network errors - this is common in preview environments
      return null
    }
  }

  const createProfile = async (userId: string, username: string, fullName: string): Promise<Profile | null> => {
    try {
      // Check if username exists
      const { data: existing } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      let finalUsername = username

      // If username exists, add a number suffix
      if (existing) {
        for (let i = 1; i <= 100; i++) {
          const testUsername = `${username}${i}`
          const { data: testExisting } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", testUsername)
            .maybeSingle()

          if (!testExisting) {
            finalUsername = testUsername
            break
          }
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          username: finalUsername,
          full_name: fullName,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("[v0] Error creating profile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return
    }

    try {
      let userProfile = await fetchProfile(user.id)

      // If profile doesn't exist, create one
      if (!userProfile && isSupabaseConfigured) {
        const username = user.email?.split("@")[0] || "user"
        const fullName = user.user_metadata?.full_name || username
        userProfile = await createProfile(user.id, username, fullName)
      }

      setProfile(userProfile)
    } catch {
      // Silently handle errors - common in preview environments
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error("Invalid email or password")
    }
  }

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "") ||
      "https://www.dearsa.africa"

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectUrl}/auth/callback`,
        data: {
          username,
          full_name: fullName,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    // Check if user already exists (Supabase returns user with identities = [] for existing emails)
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      throw new Error("An account with this email already exists. Please sign in instead.")
    }

    // Profile is automatically created by the database trigger
    // Wait a moment for the trigger to complete
    if (data.user) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "") ||
      "https://v0-new-project-tbnr6twqtwt.vercel.app"

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !loading) {
      refreshProfile()
    } else if (!user) {
      setProfile(null)
    }
  }, [user, loading])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
