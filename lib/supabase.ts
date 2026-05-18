"use client"

import { createClient } from "@/lib/supabase/client"

export const isSupabaseConfigured = true

// Re-export the singleton client
export const supabase = createClient()
