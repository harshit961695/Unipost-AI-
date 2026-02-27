import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        await requireAuth(request)

        const clientId = process.env.LINKEDIN_CLIENT_ID
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/linkedin/callback`
        const state = crypto.randomBytes(16).toString('hex')
        const scope = 'w_member_social minip/me' // r_liteprofile is legacy, minip/me is current

        const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`

        return NextResponse.redirect(authUrl)
    } catch (error: any) {
        console.error('LinkedIn connect error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=linkedin_connect_failed`)
    }
}
