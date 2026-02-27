import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        // CRITICAL: Check for common configuration error (Clerk key in Supabase var)
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        if (anonKey.startsWith('sb_publishable_')) {
            console.error('CONFIGURATION ERROR: You are using a CLERK key for Supabase. Please update .env.local with your Supabase Anon Key (starts with eyJ...).')
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=invalid_config_clerk_key_detected`)
        }

        await requireAuth(request)

        const clientId = process.env.GOOGLE_CLIENT_ID
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/youtube/callback`

        // Explicitly define scopes as requested
        const scope = [
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.upload'
        ].join(' ')

        // access_type=offline -> gets refresh token
        // prompt=consent -> forces consent screen to ensure refresh token is returned
        // response_type=code -> standard authorization code flow
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

        console.log('Initiating YouTube OAuth:', {
            redirectUri,
            scope
        })

        return NextResponse.redirect(authUrl)
    } catch (error: any) {
        console.error('YouTube Connect Route Critical Error:', {
            message: error.message,
            stack: error.stack,
            fullError: error
        })
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=youtube_init_failed&details=${encodeURIComponent(error.message)}`)
    }
}
