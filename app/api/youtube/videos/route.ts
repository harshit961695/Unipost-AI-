export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { youtubeService } from '@/lib/services/youtube';

export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const videos = await youtubeService.listVideos(user.id, supabase);
        return NextResponse.json({ success: true, videos });
    } catch (error: any) {
        console.error('[YOUTUBE VIDEOS API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch YouTube videos' },
            { status: 500 }
        );
    }
}
