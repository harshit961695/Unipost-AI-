export const dynamic = 'force-dynamic';
/**
 * Publish Post API Route
 * POST /api/posts/[id]/publish
 * Simulates publishing a post to selected platforms
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

 
console.log("Hello User")

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const postId = params.id

    // Get the post
    const { data: post, error: fetchError } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Validate post can be published
    if (post.status === 'published') {
      return NextResponse.json(
        { error: 'Post is already published' },
        { status: 400 }
      )
    }

    if (post.status === 'publishing') {
      return NextResponse.json(
        { error: 'Post is currently being published' },
        { status: 400 }
      )
    }

    // Update post status to publishing first
    const { error: updateError } = await supabaseServer
      .from('posts')
      .update({
        status: 'publishing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update post status' },
        { status: 500 }
      )
    }

    // Log publishing start
    const { error: logError } = await supabaseServer
      .from('post_logs')
      .insert({
        post_id: postId,
        user_id: user.id,
        action: 'publishing',
        status_before: post.status,
        status_after: 'publishing',
        message: `Starting publication to platforms: ${post.platforms.join(', ')}`,
      })
    if (logError) {
      console.error('Failed to create post log:', logError)
    }

    // Simulate publishing to each platform
    // In the future, this will call real social media APIs
    const publishResults: Array<{ platform: string; success: boolean; message: string }> = []

    for (const platform of post.platforms) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100))

      // Simulate success (90% success rate for demo)
      const success = Math.random() > 0.1
      
      publishResults.push({
        platform,
        success,
        message: success 
          ? `Successfully published to ${platform}` 
          : `Failed to publish to ${platform} (simulated)`,
      })

      // Log each platform attempt
      const { error: platformLogError } = await supabaseServer
        .from('post_logs')
        .insert({
          post_id: postId,
          user_id: user.id,
          action: success ? 'published' : 'failed',
          platform,
          status_before: 'publishing',
          status_after: success ? 'published' : 'failed',
          message: publishResults[publishResults.length - 1].message,
        })
      if (platformLogError) {
        console.error('Failed to create post log:', platformLogError)
      }
    }

    // Determine final status
    const allSuccess = publishResults.every(r => r.success)
    const finalStatus = allSuccess ? 'published' : 'failed'

    // Update post to final status
    const { data: updatedPost, error: finalUpdateError } = await supabaseServer
      .from('posts')
      .update({
        status: finalStatus,
        published_at: allSuccess ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
        metadata: {
          publish_results: publishResults,
          published_at: allSuccess ? new Date().toISOString() : null,
        },
      })
      .eq('id', postId)
      .select()
      .single()

    if (finalUpdateError) {
      console.error('Database final update error:', finalUpdateError)
      return NextResponse.json(
        { error: 'Failed to finalize post status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      post: updatedPost,
      results: publishResults,
      success: allSuccess,
    })
  } catch (error: any) {
    console.error('POST /api/posts/[id]/publish error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}
