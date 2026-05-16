import { createClient } from "@/lib/supabase/client"

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = isSupabaseConfigured
  ? createClient()
  : null
