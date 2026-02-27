export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { youtubeService } from '@/lib/services/youtube';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const logFile = path.join(process.cwd(), 'youtube_debug.log');
    const log = (msg: string) => {
        console.log(msg);
        try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
    };

    log('\n=======================================');
    log('[BACKEND] ENTERING /api/publish/youtube');
    log('=======================================');
    try {
        log('[BACKEND] Checking Supabase user session...');
        const supabase = createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('[BACKEND] Auth check returned an error:', authError);
        }

        if (!user) {
            log('[BACKEND] Unauthorized access attempt: No active session found.');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        log(`[BACKEND] Valid session found for User ID: ${user.id}`);

        const formData = await request.formData();
        log('[YOUTUBE PUBLISH] Received formData with keys: ' + Array.from(formData.keys()).join(', '));

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const privacyStatus = formData.get('privacy') as 'public' | 'unlisted' | 'private';
        const videoFile = formData.get('video') as File;
        const thumbnailFile = formData.get('thumbnail') as File | null;
        const type = formData.get('postType') as string;

        if (!videoFile || !title) {
            log('[YOUTUBE PUBLISH] Error: Missing required video or title fields');
            return NextResponse.json({ error: 'Missing required video or title fields' }, { status: 400 });
        }

        log(`[YOUTUBE PUBLISH] Parsed metadata - Title: "${title}", Privacy: ${privacyStatus}, Video Size: ${videoFile.size} bytes`);

        const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
        let thumbnailBuffer: Buffer | undefined;

        // Only process thumbnail for long videos
        if (thumbnailFile && type === 'long_video') {
            thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
        }

        log(`[YOUTUBE PUBLISH] Dispatching to youtubeService. uploadVideo starting...`);

        const videoData = await youtubeService.uploadVideo(
            user.id,
            videoBuffer,
            videoFile.type || 'video/mp4',
            {
                title,
                description: description || '',
                privacyStatus: privacyStatus || 'private'
            },
            thumbnailBuffer,
            supabase  // ← pass authenticated client so RLS is satisfied when reading tokens
        );

        log(`[YOUTUBE PUBLISH] Upload complete. Video Data: ${JSON.stringify(videoData)}`);

        return NextResponse.json({ success: true, video: videoData });
    } catch (error: any) {
        log('\n[BACKEND] FATAL ERROR IN ROUTE:');
        log(error.stack || error.toString());
        if (error.response?.data) {
            log('[BACKEND] YouTube API Details: ' + JSON.stringify(error.response.data));
        }
        log('=======================================\n');
        return NextResponse.json(
            { error: error.message || 'Failed to publish to YouTube' },
            { status: 500 }
        );
    }
}
