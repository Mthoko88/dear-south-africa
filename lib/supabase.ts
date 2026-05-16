import { createClient } from "@/lib/supabase/client"

export const isSupabaseConfigured = true

// Re-export the singleton client to ensure all code uses the same instance
export const supabase = createClient()
