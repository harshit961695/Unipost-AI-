export const dynamic = 'force-dynamic'
/**
 * Scheduler Cron Job API Route
 * POST /api/cron/schedule-posts
 * 
 * This endpoint should be called periodically (e.g., every minute) by:
 * - Vercel Cron Jobs
 * - External cron service (cron-job.org, etc.)
 * - Or manually for testing
 * 
 * It checks for scheduled posts that are due and publishes them.
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Optional: Add a secret token to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET

/**
 * POST /api/cron/schedule-posts
 * Processes scheduled posts that are due
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret if set
    if (CRON_SECRET) {
      const authHeader = request.headers.get('authorization')
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const now = new Date()
    const nowISO = now.toISOString()

    // Find all scheduled posts that are due (scheduled_at <= now)
    const { data: scheduledPosts, error: fetchError } = await supabaseServer
      .from('posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowISO)
      .order('scheduled_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No scheduled posts due',
        processed: 0,
      })
    }

    const results = {
      processed: 0,
      published: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        // Update status to publishing
        const { error: updateError } = await supabaseServer
          .from('posts')
          .update({
            status: 'publishing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        if (updateError) {
          throw new Error(`Failed to update post status: ${updateError.message}`)
        }

        // Log publishing start
        const { error: logError } = await supabaseServer
          .from('post_logs')
          .insert({
            post_id: post.id,
            user_id: post.user_id,
            action: 'publishing',
            status_before: 'scheduled',
            status_after: 'publishing',
            message: `Auto-publishing scheduled post to platforms: ${post.platforms.join(', ')}`,
          })
        if (logError) {
          console.error('Failed to create post log:', logError)
        }

        // Simulate publishing to each platform
        const publishResults: Array<{ platform: string; success: boolean; message: string }> = []

        for (const platform of post.platforms) {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 50))

          // Simulate success (90% success rate)
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
              post_id: post.id,
              user_id: post.user_id,
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
        const { error: finalUpdateError } = await supabaseServer
          .from('posts')
          .update({
            status: finalStatus,
            published_at: allSuccess ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
            metadata: {
              publish_results: publishResults,
              published_at: allSuccess ? new Date().toISOString() : null,
              auto_published: true,
            },
          })
          .eq('id', post.id)

        if (finalUpdateError) {
          throw new Error(`Failed to finalize post: ${finalUpdateError.message}`)
        }

        results.processed++
        if (allSuccess) {
          results.published++
        } else {
          results.failed++
        }
      } catch (error: any) {
        console.error(`Error processing post ${post.id}:`, error)
        results.errors.push(`Post ${post.id}: ${error.message}`)
        results.failed++

        // Mark post as failed
        const { error: markFailedError } = await supabaseServer
          .from('posts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            metadata: {
              error: error.message,
            },
          })
          .eq('id', post.id)
        if (markFailedError) {
          console.error('Failed to mark post as failed:', markFailedError)
        }

        // Log error
        const { error: errorLogError } = await supabaseServer
          .from('post_logs')
          .insert({
            post_id: post.id,
            user_id: post.user_id,
            action: 'failed',
            status_before: 'scheduled',
            status_after: 'failed',
            message: `Auto-publish failed: ${error.message}`,
            error_details: { error: error.message },
          })
        if (errorLogError) {
          console.error('Failed to create error log:', errorLogError)
        }
      }
    }

    return NextResponse.json({
      message: 'Scheduler completed',
      ...results,
    })
  } catch (error: any) {
    console.error('Scheduler error:', error)
    return NextResponse.json(
      { error: error.message || 'Scheduler failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/schedule-posts
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Scheduler endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
