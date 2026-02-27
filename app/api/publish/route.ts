export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { connectionService } from '@/lib/services/connectionService';
import { instagramService } from '@/lib/services/instagram';
import { youtubeService } from '@/lib/services/youtube';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const supabase = createSupabaseServerClient();
        const formData = await request.formData();

        const metadataStr = formData.get('metadata') as string;
        if (!metadataStr) {
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        let metadata: any;
        try {
            metadata = JSON.parse(metadataStr);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid metadata format' }, { status: 400 });
        }

        const platforms = Object.keys(metadata).filter(p => metadata[p].enabled);
        if (platforms.length === 0) {
            return NextResponse.json({ error: 'No platforms selected' }, { status: 400 });
        }

        const results: Record<string, 'success' | 'failure'> = {};
        const errors: Record<string, string> = {};

        // Process each platform in parallel
        // Process each platform in parallel
        const promises = platforms.map(async (platform) => {
            let status: 'success' | 'failure' = 'failure';
            let errorMessage = '';
            let tempImagePath = '';
            let platformPostId = null;

            try {
                const config = metadata[platform];

                if (platform === 'facebook') {
                    const media = formData.get('media_facebook') as File | null;
                    console.log(`[Publish API] Facebook Media Received: ${media ? `Yes (${media.name}, ${media.size} bytes)` : 'No'}`);
                    if (!media && config.type !== 'post') {
                        throw new Error('Media file is required for Facebook');
                    }

                    const { data: connection, error: connectionError } = await connectionService.getConnection(user.id, 'facebook', supabase);
                    if (connectionError || !connection) throw new Error('Facebook account not connected');

                    const pageId = connection.page_id;
                    const pageAccessToken = connection.access_token;
                    if (!pageId || !pageAccessToken) throw new Error('Incomplete Facebook connection data');

                    const isVideo = media?.type.startsWith('video');
                    const fbUrl = isVideo
                        ? `https://graph.facebook.com/v25.0/${pageId}/videos`
                        : `https://graph.facebook.com/v25.0/${pageId}/photos`;

                    const fbFormData = new FormData();
                    fbFormData.append('access_token', pageAccessToken);
                    if (config.caption) {
                        fbFormData.append(isVideo ? 'description' : 'caption', config.caption);
                    }
                    if (media) {
                        fbFormData.append('source', media);
                    }

                    const fbRes = await fetch(fbUrl, { method: "POST", body: fbFormData });
                    const fbData = await fbRes.json();
                    if (!fbRes.ok) throw new Error(fbData.error?.message || 'Facebook API error');

                    // Capture Post ID
                    platformPostId = fbData.id || fbData.post_id || null;
                    status = 'success';

                } else if (platform === 'instagram') {
                    const media = formData.get('media_instagram') as File | null;
                    console.log(`[Publish API] Instagram Media Received: ${media ? `Yes (${media.name}, ${media.size} bytes)` : 'No'}`);
                    if (!media) throw new Error('Media file is required for Instagram');

                    const { data: connection, error: connectionError } = await connectionService.getConnection(user.id, 'instagram', supabase);
                    if (connectionError || !connection) throw new Error('Instagram account not connected');

                    const instagramId = connection.instagram_business_id;
                    const accessToken = connection.access_token;
                    if (!instagramId || !accessToken) throw new Error('Incomplete Instagram connection data');

                    // Temporary upload to Supabase for IG URL
                    const fileExt = media.name.split('.').pop() || 'tmp';
                    const fileName = `${user.id}_ig_${Date.now()}.${fileExt}`;
                    tempImagePath = `temp/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('instagram_media')
                        .upload(tempImagePath, media);

                    if (uploadError) throw new Error(`Failed to upload temporary media: ${uploadError.message}`);

                    const { data: { publicUrl } } = supabase.storage
                        .from('instagram_media')
                        .getPublicUrl(tempImagePath);

                    let igResponseMap;
                    if (config.type === 'story') {
                        const mediaType = media.type.startsWith('image') ? 'IMAGE' : 'VIDEO';
                        igResponseMap = await instagramService.publishStory(instagramId, accessToken, publicUrl, mediaType);
                    } else {
                        const mediaType = config.type === 'reel' ? 'REELS' : 'IMAGE';
                        igResponseMap = await instagramService.publishMedia(instagramId, accessToken, publicUrl, config.caption || '', mediaType);
                    }
                    platformPostId = igResponseMap?.id || null; // The successful media ID
                    status = 'success';

                } else if (platform === 'youtube') {
                    const media = formData.get('media_youtube') as File | null;
                    const thumbnail = formData.get('thumbnail_youtube') as File | null;
                    console.log(`[Publish API] YouTube Media Received: ${media ? `Yes (${media.name}, ${media.size} bytes)` : 'No'}`);
                    console.log(`[Publish API] YouTube Thumbnail Received: ${thumbnail ? `Yes (${thumbnail.name}, ${thumbnail.size} bytes)` : 'No'}`);

                    if (!media || !media.type.startsWith('video')) {
                        throw new Error('YouTube requires a video file');
                    }

                    const mediaBuffer = Buffer.from(await media.arrayBuffer());
                    let thumbnailBuffer: Buffer | undefined;

                    if (thumbnail) {
                        thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());
                    }

                    const ytResponse: any = await youtubeService.uploadVideo(
                        user.id,
                        mediaBuffer,
                        media.type || 'video/mp4',
                        {
                            title: config.title || 'New Video',
                            description: config.description || '',
                            privacyStatus: config.privacy || 'private'
                        },
                        thumbnailBuffer,
                        supabase
                    );

                    platformPostId = ytResponse?.data?.id || ytResponse?.id || null;
                    status = 'success';

                } else {
                    throw new Error(`Unsupported platform: ${platform}`);
                }
            } catch (err: any) {
                status = 'failure';
                errorMessage = err.message || `Failed to publish to ${platform}`;
                errors[platform] = errorMessage;
            }

            results[platform] = status;

            // Log to database
            try {
                // Now safely passing platform_post_id to post_logs
                await supabase.from('post_logs').insert({
                    user_id: user.id,
                    platform,
                    status,
                    platform_post_id: platformPostId,
                    error_message: status === 'failure' ? errorMessage : null,
                });
            } catch (dbErr) {
                console.error(`Failed to log publish status for ${platform}:`, dbErr);
            }

            // Cleanup temp IG image if used
            if (tempImagePath) {
                await supabase.storage.from('instagram_media').remove([tempImagePath]).catch(() => { });
            }
        });

        await Promise.allSettled(promises);

        return NextResponse.json({ success: true, results, errors });
    } catch (error: any) {
        console.error('Unified Publish Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to publish' },
            { status: 500 }
        );
    }
}
