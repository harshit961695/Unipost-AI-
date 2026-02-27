export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAuthenticatedClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Get logged-in user from Supabase cookie
    const supabase = createAuthenticatedClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=auth_required`
      )
    }

    // 2️⃣ Get code from Google
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=youtube_access_denied`
      )
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`
      )
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/youtube/callback`

    // 3️⃣ Exchange code for tokens
    const tokenResponse = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      }
    )

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=token_exchange_failed`
      )
    }

    // 4️⃣ Fetch channel info
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    )

    const channelData = await channelResponse.json()
    const channelItem = channelData.items?.[0]

    if (!channelItem) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_channel_found`
      )
    }

    const channel_id = channelItem.id
    const channel_name = channelItem.snippet.title
    const thumbnail =
      channelItem.snippet.thumbnails?.default?.url || ''

    // 5️⃣ Save to Supabase
    const connectionData = {
      user_id: user.id,
      platform: 'youtube',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_at: Date.now() + tokens.expires_in * 1000,
      metadata: {
        channel_id,
        channel_name,
        thumbnail,
      },
    }

    const { data: existing } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'youtube')
      .maybeSingle()

    let saveError

    if (existing) {
      const { error } = await supabase
        .from('connected_accounts')
        .update(connectionData)
        .eq('id', existing.id)

      saveError = error
    } else {
      const { error } = await supabase
        .from('connected_accounts')
        .insert(connectionData)

      saveError = error
    }

    if (saveError) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=db_save_failed`
      )
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=youtube_connected`
    )
  } catch (err) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=youtube_connect_failed`
    )
  }
}
