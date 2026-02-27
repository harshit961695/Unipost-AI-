/**
 * Server-side authentication utilities
 * Helper functions for API routes to get authenticated user
 */
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()

    // getUser() will automatically use the cookies to validate the user
    // and refresh the token if necessary (if called in an environment where cookies can be set)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('Supabase getUser failed:', error?.message)
      return { user: null, token: null, error: error?.message || 'Authentication failed' }
    }

    // Get the session to get the access token
    const { data: { session } } = await supabase.auth.getSession()

    return {
      user,
      token: session?.access_token || null,
      error: null
    }
  } catch (error: any) {
    console.error('Auth critical error:', error)
    return { user: null, token: null, error: error?.message || 'Authentication error' }
  }
}

/**
 * Require authentication - throws error if user not authenticated
 */
export async function requireAuth(request?: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request)

  if (!user || error) {
    throw new Error(error || 'Authentication required')
  }

  return user
}

/**
 * Require authentication and return both user and token
 */
export async function requireAuthWithToken(request?: NextRequest) {
  const { user, token, error } = await getAuthenticatedUser(request)

  if (!user || error) {
    throw new Error(error || 'Authentication required')
  }

  return { user, token }
}
