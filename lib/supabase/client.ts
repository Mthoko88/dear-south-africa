import { createBrowserClient } from '@supabase/ssr'

// Read env vars with fallbacks to the non-prefixed names just in case.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

// Singleton instance so we never create more than one browser client.
let browserClient: ReturnType<typeof createBrowserClient> | null = null

/**
 * Creates (or returns the cached) Supabase client for client-side usage.
 */
export function createClient() {
  if (browserClient) return browserClient

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    )
  }

  browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return browserClient
}
