import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithToken } from '@/lib/auth/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { connectionService, ConnectionPlatform } from '@/lib/services/connectionService'

export const runtime = 'nodejs'
// Use force-dynamic so this route isn't statically cached.
export const dynamic = 'force-dynamic'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { platform: string } }
) {
    try {
        const { user, token } = await requireAuthWithToken(request)

        if (!user || !token) {
            return NextResponse.json({ success: false, error: 'Unauthorized user.' }, { status: 401 })
        }

        const platform = params.platform as ConnectionPlatform

        // Validate platform
        const validPlatforms: ConnectionPlatform[] = ['youtube', 'instagram', 'facebook', 'twitter', 'linkedin']
        if (!validPlatforms.includes(platform)) {
            return NextResponse.json({ success: false, error: 'Invalid platform specified.' }, { status: 400 })
        }

        const supabase = createSupabaseServerClient()

        // Get the current connection details to retrieve the token for revocation
        const { data: connection, error: connError } = await connectionService.getConnection(user.id, platform, supabase)

        if (connError || !connection) {
            console.warn(`[DISCONNECT] Connection for ${platform} not found in database. Assuming already disconnected.`)
            return NextResponse.json({ success: true, message: `Account already disconnected from ${platform}` })
        }

        const accessToken = connection.access_token

        // Platform-specific revocation logic
        const fetchWithTimeout = async (url: string, options: any, timeoutMs: number) => {
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

        if (platform === 'facebook' || platform === 'instagram') {
            console.log(`[DISCONNECT] Revoking Meta token for platform: ${platform}`)

            // We stored the specific page ID as a top-level column during connection:
            const pageId = connection.page_id
            const targetId = pageId || 'me' // default to 'me' if no page id

            try {
                const revokeUrl = `https://graph.facebook.com/v25.0/${targetId}/permissions?access_token=${accessToken}`
                const revokeRes = await fetchWithTimeout(revokeUrl, { method: 'DELETE' }, 8000)
                const revokeData = await revokeRes.json()

                if (revokeData.error) {
                    // Log but don't strictly fail if token is already invalid/expired
                    console.warn(`[DISCONNECT] Meta API revocation warning:`, revokeData.error)
                } else {
                    console.log(`[DISCONNECT] Successfully revoked Meta token. Response:`, revokeData)
                }
            } catch (err: any) {
                console.warn(`[DISCONNECT] Meta API request failed or timed out:`, err.message)
            }
        }
        else if (platform === 'youtube') {
            console.log(`[DISCONNECT] Revoking YouTube (Google) token...`)
            try {
                const revokeUrl = `https://oauth2.googleapis.com/revoke?token=${accessToken}`
                const revokeRes = await fetchWithTimeout(revokeUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }, 8000)

                if (!revokeRes.ok) {
                    console.warn(`[DISCONNECT] Google API revocation warning. Status: ${revokeRes.status}`)
                } else {
                    console.log(`[DISCONNECT] Successfully revoked YouTube token.`)
                }
            } catch (err: any) {
                console.warn(`[DISCONNECT] Google API request failed or timed out:`, err.message)
            }
        }
        else if (platform === 'twitter' || platform === 'linkedin') {
            console.log(`[DISCONNECT] No active revocation logic implemented for ${platform}. Safe to delete locally.`)
        }

        // Finally, after successfully notifying the external service (or if it's already invalid),
        // we drop the connection from the database to finalize the disconnect.
        // We pass the authenticated 'supabase' client so that Row Level Security receives the JWT.
        const { data: deletedData, error: deleteError } = await connectionService.disconnect(user.id, platform, supabase);

        if (deleteError) {
            console.error(`[DISCONNECT] Error deleting ${platform} database record:`, deleteError)
            return NextResponse.json({ success: false, error: 'Failed to delete connection record.' }, { status: 500 })
        }

        console.log(`[DISCONNECT] Successfully disconnected ${platform}.`)
        return NextResponse.json({ success: true, message: `Successfully disconnected ${platform}` })
    } catch (error: any) {
        console.error(`[DISCONNECT] Critical Exception:`, error)
        return NextResponse.json({ success: false, error: 'Internal server error during disconnect.' }, { status: 500 })
    }
}
// NEXTJS HMR CACHE BUST 1
