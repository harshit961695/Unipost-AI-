export const dynamic = 'force-dynamic'
/**
 * Analytics API Route
 * GET /api/analytics
 * 
 * Generates analytics data based on stored posts
 * Returns deterministic, non-zero analytics for dashboard display
 * Structure prepared for future real social API integration
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/server'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

/**
 * Calculate deterministic analytics based on post data
 * Uses post ID and creation date to generate consistent metrics
 */
function calculatePostAnalytics(post: any): {
  views: number
  likes: number
  comments: number
  shares: number
  engagementRate: number
} {
  // Use post ID as seed for deterministic values
  const seed = parseInt(post.id.replace(/-/g, '').substring(0, 8), 16)
  
  // Generate deterministic but varied metrics
  const baseViews = 1000 + (seed % 5000)
  const views = baseViews + Math.floor((Date.now() - new Date(post.created_at).getTime()) / 86400000) * 50
  
  // Engagement metrics (percentage of views)
  const engagementSeed = seed % 100
  const likes = Math.floor(views * (0.05 + (engagementSeed % 10) / 100))
  const comments = Math.floor(likes * (0.1 + (engagementSeed % 5) / 100))
  const shares = Math.floor(likes * (0.15 + (engagementSeed % 8) / 100))
  
  // Engagement rate (likes + comments + shares) / views * 100
  const totalEngagement = likes + comments + shares
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0

  return {
    views: Math.max(100, views), // Ensure minimum 100 views
    likes: Math.max(10, likes),
    comments: Math.max(1, comments),
    shares: Math.max(1, shares),
    engagementRate: Math.round(engagementRate * 100) / 100, // Round to 2 decimals
  }
}

/**
 * GET /api/analytics
 * Get analytics data for the authenticated user
 * Query params: 
 *   - period: '7d', '30d', '90d', 'all' (default: '30d')
 *   - platform: filter by platform (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '30d'
    const platform = searchParams.get('platform') // Optional platform filter

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0) // Beginning of time
        break
    }

    // Fetch published posts in date range
    let query = supabaseServer
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'published')
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: false })

    if (platform) {
      query = query.contains('platforms', [platform])
    }

    const { data: posts, error: postsError } = await query

    if (postsError) {
      console.error('Error fetching posts for analytics:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // If no posts, return zero analytics
    if (!posts || posts.length === 0) {
      return NextResponse.json({
        summary: {
          totalPosts: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          averageEngagementRate: 0,
          totalReach: 0,
        },
        platformBreakdown: {},
        recentPosts: [],
        trends: {
          views: [],
          engagement: [],
        },
      })
    }

    // Calculate analytics for each post
    const postAnalytics = posts.map(post => ({
      post,
      analytics: calculatePostAnalytics(post),
    }))

    // Aggregate totals
    const totals = postAnalytics.reduce(
      (acc, { analytics }) => ({
        views: acc.views + analytics.views,
        likes: acc.likes + analytics.likes,
        comments: acc.comments + analytics.comments,
        shares: acc.shares + analytics.shares,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0 }
    )

    const totalEngagement = totals.likes + totals.comments + totals.shares
    const averageEngagementRate = totals.views > 0
      ? (totalEngagement / totals.views) * 100
      : 0

    // Platform breakdown
    const platformBreakdown: Record<string, {
      posts: number
      views: number
      likes: number
      comments: number
      shares: number
      engagementRate: number
    }> = {}

    posts.forEach((post) => {
      const analytics = calculatePostAnalytics(post)
      post.platforms.forEach((platform: string) => {
        if (!platformBreakdown[platform]) {
          platformBreakdown[platform] = {
            posts: 0,
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            engagementRate: 0,
          }
        }
        platformBreakdown[platform].posts++
        platformBreakdown[platform].views += analytics.views
        platformBreakdown[platform].likes += analytics.likes
        platformBreakdown[platform].comments += analytics.comments
        platformBreakdown[platform].shares += analytics.shares
      })
    })

    // Calculate engagement rates per platform
    Object.keys(platformBreakdown).forEach((platform) => {
      const data = platformBreakdown[platform]
      const totalEng = data.likes + data.comments + data.shares
      data.engagementRate = data.views > 0
        ? Math.round((totalEng / data.views) * 100 * 100) / 100
        : 0
    })

    // Recent posts with analytics
    const recentPosts = postAnalytics
      .slice(0, 10)
      .map(({ post, analytics }) => ({
        id: post.id,
        title: post.title || post.caption.substring(0, 50) + '...',
        platforms: post.platforms,
        publishedAt: post.published_at,
        analytics: {
          views: analytics.views,
          likes: analytics.likes,
          comments: analytics.comments,
          shares: analytics.shares,
          engagementRate: analytics.engagementRate,
        },
      }))

    // Generate trend data (last 7 days)
    const trendDays = 7
    const trends = {
      views: Array.from({ length: trendDays }, (_, i) => {
        const date = new Date(now.getTime() - (trendDays - i - 1) * 24 * 60 * 60 * 1000)
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))
        
        const dayPosts = posts.filter(
          (p) =>
            p.published_at &&
            new Date(p.published_at) >= dayStart &&
            new Date(p.published_at) <= dayEnd
        )
        
        const dayViews = dayPosts.reduce((sum, p) => {
          return sum + calculatePostAnalytics(p).views
        }, 0)
        
        return {
          date: dayStart.toISOString().split('T')[0],
          value: dayViews,
        }
      }),
      engagement: Array.from({ length: trendDays }, (_, i) => {
        const date = new Date(now.getTime() - (trendDays - i - 1) * 24 * 60 * 60 * 1000)
        const dayStart = new Date(date.setHours(0, 0, 0, 0))
        const dayEnd = new Date(date.setHours(23, 59, 59, 999))
        
        const dayPosts = posts.filter(
          (p) =>
            p.published_at &&
            new Date(p.published_at) >= dayStart &&
            new Date(p.published_at) <= dayEnd
        )
        
        if (dayPosts.length === 0) {
          return {
            date: dayStart.toISOString().split('T')[0],
            value: 0,
          }
        }
        
        const dayAnalytics = dayPosts.map(calculatePostAnalytics)
        const totalViews = dayAnalytics.reduce((sum, a) => sum + a.views, 0)
        const totalEngagement = dayAnalytics.reduce(
          (sum, a) => sum + a.likes + a.comments + a.shares,
          0
        )
        const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0
        
        return {
          date: dayStart.toISOString().split('T')[0],
          value: Math.round(engagementRate * 100) / 100,
        }
      }),
    }

    return NextResponse.json({
      summary: {
        totalPosts: posts.length,
        totalViews: totals.views,
        totalLikes: totals.likes,
        totalComments: totals.comments,
        totalShares: totals.shares,
        averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
        totalReach: totals.views, // Reach = views for now
      },
      platformBreakdown,
      recentPosts,
      trends,
      period,
    })
  } catch (error: any) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message?.includes('Authentication') ? 401 : 500 }
    )
  }
}
