export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { connectionService } from '@/lib/services/connectionService'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request)
        const code = request.nextUrl.searchParams.get('code')

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`)
        }

        // Exchange code for token
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/linkedin/callback`,
                client_id: process.env.LINKEDIN_CLIENT_ID!,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET!
            })
        })

        const tokens = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error('LinkedIn token error:', tokens)
            throw new Error('Failed to exchange token')
        }

        // Get user profile
        const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        })
        const profile = await profileResponse.json()

        // Save connection
        await connectionService.saveConnection(user.id, {
            platform: 'linkedin',
            accessToken: tokens.access_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
            metadata: {
                firstName: profile.localizedFirstName,
                lastName: profile.localizedLastName,
                id: profile.id
            }
        })

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=linkedin_connected`)
    } catch (error: any) {
        console.error('LinkedIn callback error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=linkedin_callback_failed`)
    }
}
