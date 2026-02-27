export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { connectionService } from '@/lib/services/connectionService'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request)
        const code = request.nextUrl.searchParams.get('code')
        const codeVerifier = request.cookies.get('twitter_code_verifier')?.value

        if (!code || !codeVerifier) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code_or_verifier`)
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/twitter/callback`,
                code_verifier: codeVerifier
            })
        })

        const tokens = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error('Twitter token error:', tokens)
            throw new Error('Failed to exchange token')
        }

        // Get user info
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        })
        const userData = await userResponse.json()

        // Save connection
        await connectionService.saveConnection(user.id, {
            platform: 'twitter',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            metadata: {
                username: userData.data?.username,
                name: userData.data?.name,
                id: userData.data?.id
            }
        })

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=twitter_connected`)
    } catch (error: any) {
        console.error('Twitter callback error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=twitter_callback_failed`)
    }
}
