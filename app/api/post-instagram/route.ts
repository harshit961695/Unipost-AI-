export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { connectionService } from '@/lib/services/connectionService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const { imageUrl, caption } = await request.json();

        if (!imageUrl) {
            return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
        }

        const supabase = createSupabaseServerClient();

        // Retrieve stored connections for this user
        const { data: connections, error: connectionsError } = await supabase
            .from('platform_connections')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'instagram')
            .eq('status', 'connected');

        if (connectionsError || !connections || connections.length === 0) {
            return NextResponse.json({ error: 'Instagram account not connected' }, { status: 400 });
        }

        const connection = connections[0]; // Assuming one IG connection per user for now

        if (!connection || !connection.access_token || !connection.metadata?.instagramId) {
            return NextResponse.json({ error: 'Instagram token or ID not found' }, { status: 404 });
        }

        const accessToken = connection.access_token;
        const igUserId = connection.metadata.instagramId;

        // Step 1: Create media container
        const createMediaResponse = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image_url: imageUrl,
                caption: caption || '',
                access_token: accessToken
            })
        });

        const createMediaData = await createMediaResponse.json();

        if (!createMediaResponse.ok || createMediaData.error) {
            console.error('Instagram Media Creation API Error:', createMediaData.error);
            throw new Error(createMediaData.error?.message || 'Failed to create Instagram media container');
        }

        const creationId = createMediaData.id;

        // Step 2: Publish the media container
        const publishResponse = await fetch(`https://graph.facebook.com/v25.0/${igUserId}/media_publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                creation_id: creationId,
                access_token: accessToken
            })
        });

        const publishData = await publishResponse.json();

        if (!publishResponse.ok || publishData.error) {
            console.error('Instagram Media Publish API Error:', publishData.error);
            throw new Error(publishData.error?.message || 'Failed to publish to Instagram');
        }

        return NextResponse.json({ success: true, postId: publishData.id });

    } catch (error: any) {
        console.error('Publish Instagram API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error occurred while publishing to Instagram' },
            { status: 500 }
        );
    }
}
