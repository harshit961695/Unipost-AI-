import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(request)

        const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
        console.log('[META OAUTH] Generating URL with client_id:', clientId);

        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/meta/callback`
        const scopes = [
            'pages_show_list',
            'pages_manage_posts',
            'instagram_basic',
            'instagram_content_publish',
            'business_management'
        ].join(',')

        // Simple state for CSRF protection
        const state = Math.random().toString(36).substring(7)

        const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code&auth_type=reauthenticate,rerequest`

        console.log('[META OAUTH] Redirecting to URL:', authUrl);

        return NextResponse.redirect(authUrl)
    } catch (error: any) {
        // Log error and redirect to settings with error flag
        console.error('Meta connect error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=meta_connect_failed`)
    }
}
