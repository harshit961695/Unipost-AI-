export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { youtubeService } from '@/lib/services/youtube';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { videoId: string } }
) {
    try {
        const supabase = createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, privacyStatus } = await request.json();
        const videoId = params.videoId;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const result = await youtubeService.updateVideo(
            user.id,
            videoId,
            { title, description, privacyStatus },
            supabase
        );

        return NextResponse.json({ success: true, data: result.data });
    } catch (error: any) {
        console.error('[YOUTUBE VIDEO UPDATE API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update YouTube video' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { videoId: string } }
) {
    try {
        const supabase = createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const videoId = params.videoId;
        await youtubeService.deleteVideo(user.id, videoId, supabase);

        return NextResponse.json({ success: true, message: 'Video deleted successfully' });
    } catch (error: any) {
        console.error('[YOUTUBE VIDEO DELETE API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete YouTube video' },
            { status: 500 }
        );
    }
}
