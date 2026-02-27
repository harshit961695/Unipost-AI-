export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAuthWithToken } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { connectionService } from '@/lib/services/connectionService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageUrl, caption } = body;

        // Validate inputs
        if (!imageUrl) {
            return NextResponse.json({ success: false, error: "Image URL is required" }, { status: 400 });
        }

        // Authenticate User Session
        const { user, token } = await requireAuthWithToken(request)
        const supabase = createSupabaseServerClient()

        // Fetch User's specific Facebook Page ID and Access Token from the database
        const { data: connection, error: dbError } = await connectionService.getConnection(user.id, 'facebook', supabase)

        if (dbError || !connection) {
            return NextResponse.json({ success: false, error: "Facebook account not connected. Please connect in Settings." }, { status: 400 });
        }

        const FB_PAGE_ID = connection.page_id;
        const FB_PAGE_ACCESS_TOKEN = connection.access_token;

        if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
            console.error("[FB POST ERROR] Missing Page ID or Access Token in database record:", connection.id);
            return NextResponse.json({ success: false, error: "Incomplete Facebook connection data. Please reconnect in Settings." }, { status: 500 });
        }

        const url = `https://graph.facebook.com/v25.0/${FB_PAGE_ID}/photos`;

        // Send POST request to Facebook Graph API
        const response = await axios.post(url, {
            url: imageUrl,
            caption: caption || "",
            access_token: FB_PAGE_ACCESS_TOKEN
        });

        // Return Success Response
        return NextResponse.json({
            success: true,
            postId: response.data.post_id,
            photoId: response.data.id
        }, { status: 200 });

    } catch (error: any) {
        // If error is from Axios (Facebook Graph API returned an error payload)
        if (error.response) {
            console.error("[FACEBOOK GRAPH API ERROR]", JSON.stringify(error.response.data, null, 2));
            return NextResponse.json(
                { success: false, error: error.response.data },
                { status: error.response.status || 400 }
            );
        }

        // Network or internal parsing errors
        console.error("[FACEBOOK POST CRITICAL ERROR]", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
