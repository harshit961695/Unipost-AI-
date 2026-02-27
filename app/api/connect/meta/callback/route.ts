import { NextRequest, NextResponse } from 'next/server'
import { requireAuthWithToken } from '@/lib/auth/server'
import { createAuthenticatedClient } from '@/lib/supabase/server'
import { connectionService } from '@/lib/services/connectionService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // Helper for structured error logging
    const logError = (stage: string, details: any) => {
        console.error(`[META OAUTH ERROR - ${stage}]`, JSON.stringify(details, null, 2));
    };

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

    try {
        console.log('[META CALLBACK] Request received');

        const { user, token } = await requireAuthWithToken(request)
        if (!token) throw new Error('No authentication token');

        const supabase = createAuthenticatedClient(token);

        const code = request.nextUrl.searchParams.get('code')
        const error = request.nextUrl.searchParams.get('error')
        const error_description = request.nextUrl.searchParams.get('error_description')

        // 2. On redirect: Read `code` from query params. If error exists, log full error
        if (error) {
            logError('Authorization Redirect', { error, error_description });
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=meta_auth_denied`)
        }

        if (!code) {
            logError('Missing Code', 'No code received from Facebook.');
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_code`)
        }

        const clientId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const clientSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect/meta/callback`;

        if (!clientId || !clientSecret) {
            logError('Missing Config', 'META_APP_ID or META_APP_SECRET not configured');
            throw new Error('Server configuration error');
        }

        // 3. Exchange code for short-lived token:
        console.log('[META CALLBACK] Exchanging code for short-lived token...');
        const tokenUrl = `https://graph.facebook.com/v25.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`;

        const tokenResponse = await fetchWithTimeout(tokenUrl, {}, 8000);
        const tokenData = await tokenResponse.json();

        if (tokenData.error || !tokenData.access_token) {
            logError('Short-lived Token Exchange', tokenData);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=token_exchange_failed`)
        }

        const shortLivedToken = tokenData.access_token;

        // 4. Exchange short-lived token for long-lived token:
        console.log('[META CALLBACK] Exchanging short-lived token for long-lived token...');
        const longLivedUrl = `https://graph.facebook.com/v25.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;

        const longLivedResponse = await fetchWithTimeout(longLivedUrl, {}, 8000);
        const longLivedData = await longLivedResponse.json();

        if (longLivedData.error) {
            logError('Long-lived Token Exchange', longLivedData);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=token_exchange_failed`)
        }

        // Sometimes Facebook just returns the same token if it's already long-lived, 
        // or expires_in might be omitted. We use the new one if provided, else fallback.
        const longLivedUserToken = longLivedData.access_token || shortLivedToken;

        // Let's assume a ~60 day expiry for long-lived user tokens if not provided
        const userTokenExpiresIn = longLivedData.expires_in ? longLivedData.expires_in * 1000 : 60 * 24 * 60 * 60 * 1000;
        const userTokenExpiryTime = new Date(Date.now() + userTokenExpiresIn);

        // 5. Fetch Page access token:
        console.log('[META CALLBACK] Fetching /me/accounts for pages...');
        const pagesUrl = `https://graph.facebook.com/v25.0/me/accounts?access_token=${longLivedUserToken}`;
        const pagesResponse = await fetchWithTimeout(pagesUrl, {}, 8000);
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
            logError('Fetch Pages', pagesData);
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=meta_api_error`)
        }

        if (!pagesData.data || pagesData.data.length === 0) {
            logError('No Pages Found', 'User has no Facebook pages or did not grant pages_show_list permission.');
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=no_pages_found`)
        }

        let facebookConnected = false;
        let instagramConnected = false;
        let saveErrors: string[] = [];

        // 6. From page response, extract page_id, page_access_token
        for (const page of pagesData.data) {
            const pageId = page.id;
            const pageName = page.name;
            const pageAccessToken = page.access_token;

            console.log(`[META CALLBACK] Processing page: ${pageName} (${pageId})`);

            // 7. Fetch Instagram Business Account:
            let instagramBusinessId = null;
            try {
                const igUrl = `https://graph.facebook.com/v25.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
                const igResponse = await fetchWithTimeout(igUrl, {}, 8000);
                const igData = await igResponse.json();

                if (igData.error) {
                    logError(`Fetch IG Business Account for Page ${pageId}`, igData);
                } else if (igData.instagram_business_account) {
                    instagramBusinessId = igData.instagram_business_account.id;
                    console.log(`[META CALLBACK] Found IG Business ID: ${instagramBusinessId} for Page: ${pageName}`);
                }
            } catch (err: any) {
                logError(`Exception finding IG Business Account for Page ${pageId}`, err.message);
            }

            // 8. Save securely in database:
            // - user_id (handled by connectionService)
            // - page_id
            // - page_access_token (as main access token)
            // - instagram_business_id
            // - long_lived_user_token
            // - expiry_time

            const metadata = {
                page_id: pageId,
                page_name: pageName,
                page_access_token: pageAccessToken,
                instagram_business_id: instagramBusinessId || undefined,
                long_lived_user_token: longLivedUserToken,
                expires_at: userTokenExpiryTime
            };

            // Save Facebook Connection (using Page Access Token)
            if (!facebookConnected) {
                const fbResult = await connectionService.saveConnection(user.id, {
                    platform: 'facebook',
                    accessToken: pageAccessToken, // Using never-expiring page access token
                    expiresAt: userTokenExpiryTime, // Page tokens don't technically expire but good to have
                    pageId: pageId,
                    metadata: metadata
                }, supabase);

                if (fbResult.error) {
                    saveErrors.push(`Facebook (${pageName}): ${fbResult.error}`);
                    logError(`Database save failure (Facebook, Page ${pageId})`, fbResult.error);
                } else {
                    facebookConnected = true;
                }
            }

            // Save Instagram Connection (if linked)
            if (instagramBusinessId && !instagramConnected) {
                const igResult = await connectionService.saveConnection(user.id, {
                    platform: 'instagram',
                    accessToken: pageAccessToken, // App uses Page Token to act on behalf of IG account too
                    expiresAt: userTokenExpiryTime,
                    pageId: pageId,
                    instagramBusinessId: instagramBusinessId,
                    metadata: metadata
                }, supabase);

                if (igResult.error) {
                    saveErrors.push(`Instagram (${pageName}): ${igResult.error}`);
                    logError(`Database save failure (Instagram, Page ${pageId})`, igResult.error);
                } else {
                    instagramConnected = true;
                }
            }
        }

        // 9. Return success response instead of connection_save_failed
        if (!facebookConnected && !instagramConnected) {
            console.error('[META CALLBACK] FAILED to connect anything. Errors:', saveErrors);
            const errorParam = saveErrors.length > 0 ? 'connection_save_failed' : 'no_pages_found';
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=${errorParam}`)
        }

        if (!instagramConnected) {
            console.warn('[META CALLBACK] WARNING: No Instagram Business Account linked to any of the user\'s Facebook pages.');
        }

        console.log(`[META CALLBACK] Successfully connected. Facebook: ${facebookConnected}, Instagram: ${instagramConnected}`);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=meta_connected`)

    } catch (error: any) {
        console.error('[META CALLBACK] Unhandled error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=meta_callback_failed`)
    }
}

