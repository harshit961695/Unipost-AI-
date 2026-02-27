export const dynamic = 'force-dynamic';
/**
 * Individual Post API Route
 * Handles: GET (single post), PATCH (update post), DELETE (delete post)
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * GET /api/posts/[id]
 * Get a single post by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const postId = params.id

    const { data: post, error } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error('GET /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}

/**
 * PATCH /api/posts/[id]
 * Update a post (save draft, reschedule, etc.)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const postId = params.id

    // First, verify post exists and belongs to user
    const { data: existingPost, error: fetchError } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { caption, platforms, title, media_urls, scheduled_at, status } = body

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (caption !== undefined) {
      if (typeof caption !== 'string' || caption.trim().length === 0) {
        return NextResponse.json(
          { error: 'Caption cannot be empty' },
          { status: 400 }
        )
      }
      updates.caption = caption.trim()
    }

    if (platforms !== undefined) {
      if (!Array.isArray(platforms) || platforms.length === 0) {
        return NextResponse.json(
          { error: 'At least one platform is required' },
          { status: 400 }
        )
      }
      updates.platforms = platforms
    }

    if (title !== undefined) updates.title = title || null
    if (media_urls !== undefined) updates.media_urls = media_urls || []
    if (scheduled_at !== undefined) {
      updates.scheduled_at = scheduled_at ? new Date(scheduled_at).toISOString() : null
    }

    // Handle status changes
    if (status !== undefined) {
      const oldStatus = existingPost.status
      let newStatus = status

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        draft: ['scheduled', 'published'],
        scheduled: ['draft', 'published', 'publishing'],
        publishing: ['published', 'failed'],
        published: [], // Published posts cannot change status
        failed: ['draft', 'scheduled'],
      }

      if (oldStatus === 'published') {
        return NextResponse.json(
          { error: 'Published posts cannot be modified' },
          { status: 400 }
        )
      }

      if (validTransitions[oldStatus] && !validTransitions[oldStatus].includes(newStatus)) {
        return NextResponse.json(
          { error: `Cannot transition from ${oldStatus} to ${newStatus}` },
          { status: 400 }
        )
      }

      updates.status = newStatus

      // Set published_at if publishing
      if (newStatus === 'published') {
        updates.published_at = new Date().toISOString()
      }

      // Create log entry for status change
      const { error: logError } = await supabaseServer
        .from('post_logs')
        .insert({
          post_id: postId,
          user_id: user.id,
          action: 'status_changed',
          status_before: oldStatus,
          status_after: newStatus,
          message: `Status changed from ${oldStatus} to ${newStatus}`,
        })

      if (logError) {
        console.error('Failed to create post log:', logError)
      }
    }

    // Update post
    const { data: updatedPost, error: updateError } = await supabaseServer
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ post: updatedPost })
  } catch (error: any) {
    console.error('PATCH /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const postId = params.id

    // Verify post exists and belongs to user
    const { data: existingPost, error: fetchError } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Delete post (cascade will handle logs and analytics)
    const { error: deleteError } = await supabaseServer
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/posts/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}
