"use client"

import { createClient as createBrowserClient } from "@/lib/supabase/client"

export const isSupabaseConfigured = true

// Export the function for creating clients
export const createClient = createBrowserClient

// Lazy singleton pattern - only create the client when first accessed
let _supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const getSupabase = () => {
  if (!_supabaseInstance) {
    _supabaseInstance = createBrowserClient()
  }
  return _supabaseInstance
}

// For backward compatibility, use a getter
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    return getSupabase()[prop as keyof ReturnType<typeof createBrowserClient>]
  }
})
