import { createClient as createBrowserClient } from "@/lib/supabase/client"

export const isSupabaseConfigured = 
  typeof window !== 'undefined' && 
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Lazy initialization to avoid SSR issues
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    if (typeof window === 'undefined') {
      // Return a no-op during SSR
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ error: new Error('SSR') }),
          signUp: () => Promise.resolve({ error: new Error('SSR') }),
          signOut: () => Promise.resolve({ error: null }),
          resetPasswordForEmail: () => Promise.resolve({ error: new Error('SSR') }),
        }
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
          insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        })
      }
      return () => {}
    }
    
    if (!_supabase) {
      _supabase = createBrowserClient()
    }
    return (_supabase as any)[prop]
  }
})
