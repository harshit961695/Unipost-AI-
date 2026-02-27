export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithToken } from '@/lib/auth/server'
import { createAuthenticatedClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        const { user, token } = await requireAuthWithToken(request)

        if (!user || !token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=auth_required`)
        }

        // Delete the connection record
        const supabase = createAuthenticatedClient(token)
        const { error } = await supabase
            .from('connected_accounts')
            .delete()
            .eq('user_id', user.id)
            .eq('platform', 'youtube')

        if (error) {
            console.error('YouTube Disconnect Error:', error)
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=disconnect_failed`)
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=youtube_disconnected`)
    } catch (error) {
        console.error('YouTube Disconnect Critical Exception:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=disconnect_failed`)
    }
}
