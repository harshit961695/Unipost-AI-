export const dynamic = 'force-dynamic'
/**
 * Posts API Route
 * Handles: GET (list posts), POST (create/save draft)
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { supabaseService } from '@/lib/services/supabaseService'

export const runtime = 'nodejs'

/**
 * GET /api/posts
 * List all posts for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: posts, error } = await supabaseService.getPosts(user.id, {
      status,
      limit,
      offset
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts })
  } catch (error: any) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}

/**
 * POST /api/posts
 * Create a new post or save as draft
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { caption, platforms, title, media_urls, scheduled_at, status = 'draft' } = body

    // Validation
    if (!caption?.trim()) {
      return NextResponse.json({ error: 'Caption is required' }, { status: 400 })
    }

    if (!platforms?.length) {
      return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 })
    }

    // Determine status
    let finalStatus = status
    let scheduledAt = scheduled_at ? new Date(scheduled_at) : null

    if (scheduledAt && scheduledAt > new Date()) {
      finalStatus = 'scheduled'
    } else if (status === 'draft') {
      scheduledAt = null
    }

    // Create post
    const { data: post, error } = await supabaseService.createPost({
      user_id: user.id,
      title: title || null,
      caption: caption.trim(),
      media_urls: media_urls || [],
      platforms,
      status: finalStatus,
      scheduled_at: scheduledAt?.toISOString() || null,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      metadata: {},
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    // Async log (don't await)
    supabaseService.logPostAction({
      post_id: post.id,
      user_id: user.id,
      action: 'post_created',
      status_after: finalStatus,
      message: `Post ${finalStatus}`
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}
