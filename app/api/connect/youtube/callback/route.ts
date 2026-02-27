export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithToken } from '@/lib/auth/server'
import { createAuthenticatedClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        // 1. Get Logged-in User
        const { user, token } = await requireAuthWithToken(request)

        if (!user || !token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=auth_required`)
        }

        const fetchWithTimeout = async (url: string, options: any = {}, timeoutMs: number = 8000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(id);
                return response;
            } catch (err) {
                clearTimeout(id);
                throw err;
            }
        };

        // 2. Get Code
        const code = request.nextUrl.searchParams.get('code')
        const error = request.nextUrl.searchParams.get('error')

        console.log('YouTube Callback Received:', {
            hasCode: !!code,
            error,
            userId: user.id
        })

        if (error) {
            console.error('YouTube OAuth Error from Google:', error)
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=youtube_access_denied`)
        }

        if (!code) {
            console.error('YouTube Callback: No code received')
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`)
        }

        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/youtube/callback`

        // 3. Exchange Code for Tokens
        console.log('Exchanging code for tokens with redirect_uri:', redirectUri)

        const tokenResponse = await fetchWithTimeout('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        }, 8000)

        const tokens = await tokenResponse.json()

        if (!tokenResponse.ok) {
            console.error('YouTube Token Exchange Error:', tokens)
            // Check for specific error like "redirect_uri_mismatch"
            if (tokens.error === 'redirect_uri_mismatch') {
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=redirect_mismatch`)
            }
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=token_exchange_failed`)
        }

        console.log('Token exchange successful. Access token received.')

        // 4. Fetch Channel Info
        const channelResponse = await fetchWithTimeout('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        }, 8000)

        if (!channelResponse.ok) {
            const errorText = await channelResponse.text()
            console.error('YouTube Channel Fetch Error:', {
                status: channelResponse.status,
                body: errorText
            })
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=channel_fetch_failed`)
        }

        const channelData = await channelResponse.json()
        const channelItem = channelData.items?.[0]

        if (!channelItem) {
            console.error('No YouTube channel found for this user account.')
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_channel_found`)
        }

        const { id: channel_id, snippet } = channelItem
        const { title: channel_name, thumbnails } = snippet
        const thumbnail = thumbnails?.default?.url || ''

        console.log('YouTube Channel Found:', { channel_id, channel_name })

        // 5. Store in Supabase
        const supabase = createAuthenticatedClient(token)

        const connectionData = {
            user_id: user.id,
            platform: 'youtube',
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token, // Only present if access_type=offline and prompt=consent
            expires_at: Date.now() + tokens.expires_in * 1000,
            metadata: {
                channel_id,
                channel_name,
                thumbnail
            }
        };

        // Check if connection already exists
        const { data: existingConnection } = await supabase
            .from('connected_accounts')
            .select('id')
            .eq('user_id', user.id)
            .eq('platform', 'youtube')
            .maybeSingle();

        let saveError;
        if (existingConnection) {
            // Update existing
            const { error } = await supabase
                .from('connected_accounts')
                .update(connectionData)
                .eq('id', existingConnection.id);
            saveError = error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('connected_accounts')
                .insert(connectionData);
            saveError = error;
        }

        if (saveError) {
            console.error('Supabase Save Error:', saveError);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=db_save_failed&details=${encodeURIComponent(saveError.message)}`)
        }

        console.log('YouTube Connection Saved Successfully')

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=youtube_connected`)

    } catch (error: any) {
        console.error('YouTube Callback Critical Exception:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=youtube_connect_failed`)
    }
}
