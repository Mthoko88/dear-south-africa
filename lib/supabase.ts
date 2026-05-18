"use client"

import { createClient as createBrowserClient } from "@/lib/supabase/client"

export const isSupabaseConfigured = true

// Export both the function and a singleton instance for convenience
export const createClient = createBrowserClient
export const supabase = createBrowserClient()
