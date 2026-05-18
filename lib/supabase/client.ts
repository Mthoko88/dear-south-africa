import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for client-side (browser) usage.
 * This uses a singleton pattern to reuse the same client instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
