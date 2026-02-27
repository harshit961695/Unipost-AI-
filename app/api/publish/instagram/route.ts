export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { instagramService } from '@/lib/services/instagram';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const formData = await request.formData();

        const mediaFile = formData.get('media') as File;
        const caption = (formData.get('caption') as string) || '';
        const type = formData.get('type') as 'reel' | 'post' | 'story';

        if (!mediaFile || !type) {
            return NextResponse.json({ error: 'Missing media or type' }, { status: 400 });
        }

        // 1. Get Instagram Credentials
        const supabase = createSupabaseServerClient();
        const { instagramId, accessToken } = await instagramService.getInstagramAccountId(user.id, supabase);

        // 2. Upload file temporarily to Supabase Storage to get a Public URL
        // Meta Graph API requires public URLs for media
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `temp/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('instagram_media') // IMPORTANT: User must create a public bucket named "instagram_media"
            .upload(filePath, mediaFile);

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            throw new Error(`Failed to upload media to storage: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('instagram_media')
            .getPublicUrl(filePath);

        // 3. Publish to Instagram
        let creationId;
        try {
            if (type === 'story') {
                const mediaType = mediaFile.type.startsWith('image') ? 'IMAGE' : 'VIDEO';
                creationId = await instagramService.publishStory(instagramId, accessToken, publicUrl, mediaType);
            } else {
                const mediaType = type === 'reel' ? 'REELS' : 'IMAGE';
                creationId = await instagramService.publishMedia(instagramId, accessToken, publicUrl, caption, mediaType);
            }
        } catch (igError: any) {
            // Clean up temp file on failure
            await supabase.storage.from('instagram_media').remove([filePath]);
            throw igError;
        }

        // 4. Clean up temp file on success
        await supabase.storage.from('instagram_media').remove([filePath]);

        return NextResponse.json({ success: true, creationId });

    } catch (error: any) {
        console.error('Instagram Publish Error:', error);

        let errorMessage = error.message || 'Failed to publish to Instagram';

        // Check if our service threw the structured APP_DELETED JSON error
        try {
            const parsedError = JSON.parse(errorMessage);
            if (parsedError.type === 'APP_DELETED') {
                try {
                    // Attempt to pre-fetch user again in case `user` variable is out of scope 
                    // (though it shouldn't be here since it was assigned line 10)
                    const user = await requireAuth(request);
                    const supabase = createSupabaseServerClient();

                    console.log(`[INSTAGRAM PUBLISH] App deleted detected. Dropping legacy DB connections for user ${user.id}`);

                    // Clean up bad connections immediately so they don't persist in Settings
                    await supabase.from('connected_accounts').delete().eq('user_id', user.id).eq('platform', 'instagram');
                    await supabase.from('connected_accounts').delete().eq('user_id', user.id).eq('platform', 'facebook');

                } catch (dbError) {
                    console.error('[INSTAGRAM PUBLISH] Failed to drop deleted DB app tokens', dbError);
                }

                // Return exact failure response requested
                return NextResponse.json({
                    success: false,
                    error: parsedError.message
                }, { status: 400 });
            }
        } catch (e) {
            // Not JSON or parse failed, continue to standard error formatting below
        }

        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
