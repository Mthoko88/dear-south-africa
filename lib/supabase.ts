"use client"

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export const isSupabaseConfigured = true

// Singleton client instance
let _supabase: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (_supabase) {
    return _supabase
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  _supabase = createBrowserClient(supabaseUrl, supabaseKey)
  return _supabase
}

// For backward compatibility - lazily initialized
export const supabase = {
  get auth() {
    return getSupabaseClient().auth
  },
  from(table: string) {
    return getSupabaseClient().from(table)
  },
  rpc(fn: string, params?: any) {
    return getSupabaseClient().rpc(fn, params)
  },
  storage: {
    from(bucket: string) {
      return getSupabaseClient().storage.from(bucket)
    }
  }
} as unknown as SupabaseClient
