import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function createClient() {
  // Only create client on the browser
  if (typeof window === 'undefined') {
    throw new Error('createClient should only be called on the client side')
  }
  
  if (client) {
    return client
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  client = createBrowserClient(supabaseUrl, supabaseKey)
  
  return client
}
