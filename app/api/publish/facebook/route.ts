export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { connectionService } from '@/lib/services/connectionService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const formData = await request.formData();
        const type = formData.get('type') as string;
        const caption = formData.get('caption') as string;
        const media = formData.get('media') as File;

        if (!type || !['post', 'reel', 'story'].includes(type)) {
            return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
        }

        if (!media && type !== 'post') { // allow text only posts theoretically, but our UI requires media for now
            return NextResponse.json({ error: 'Media file is required' }, { status: 400 });
        }

        const supabase = createSupabaseServerClient();
        const { data: connection, error: connectionError } = await connectionService.getConnection(user.id, 'facebook', supabase);

        if (connectionError || !connection) {
            return NextResponse.json({ error: 'Facebook account not connected' }, { status: 400 });
        }

        const pageId = connection.page_id;
        const pageAccessToken = connection.access_token;

        if (!pageId || !pageAccessToken) {
            return NextResponse.json({ error: 'Incomplete Facebook connection data' }, { status: 500 });
        }

        let fbUrl = `https://graph.facebook.com/v25.0/${pageId}/feed`;

        // If media is present, the spec allows hitting /photos endpoint. 
        // For text-only, we strictly use URLSearchParams to /feed.
        let fbBody: any;

        if (media && type === 'post') {
            fbUrl = `https://graph.facebook.com/v25.0/${pageId}/photos`;
            const fbFormData = new FormData();
            fbFormData.append('access_token', pageAccessToken);
            if (caption) fbFormData.append('caption', caption);
            fbFormData.append('source', media);
            fbBody = fbFormData;
        } else {
            fbBody = new URLSearchParams({
                message: caption || '',
                access_token: pageAccessToken,
            });
        }

        const response = await fetch(fbUrl, {
            method: "POST",
            body: fbBody,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ success: false, error: data }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Publish Facebook Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish to Facebook' },
            { status: 500 }
        );
    }
}
