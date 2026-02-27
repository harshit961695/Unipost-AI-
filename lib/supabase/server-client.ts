/**
 * Server-side Supabase client with proper cookie handling
 * Uses @supabase/ssr for Next.js App Router compatibility
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Get authenticated Supabase client for server-side use
 * This properly handles cookies and authentication state
 */
export async function getServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Ignore cookie setting errors in middleware/edge
          }
        },
      },
    }
  )
}

/**
 * Get authenticated user from server-side request
 * Returns null if not authenticated
 */
export async function getServerUser() {
  try {
    const supabase = await getServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}
