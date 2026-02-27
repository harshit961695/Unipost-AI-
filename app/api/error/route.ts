export const dynamic = 'force-dynamic'
/**
 * Global Error Handler API Route
 * Catches any unhandled errors in API routes
 * This is a fallback - individual routes should handle their own errors
 */
import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/api/error-handler'

export const runtime = 'nodejs'

/**
 * This route should never be called directly
 * It's here as a safety net for error handling
 */
export async function GET() {
  return NextResponse.json({
    message: 'Error handler endpoint',
    note: 'This endpoint is for error handling infrastructure only',
  })
}

/**
 * Catch-all error handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { error, context } = body

    // Log the error
    console.error('Global error handler received error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    })

    return createErrorResponse(
      error || new Error('Unknown error'),
      'An error occurred',
      500
    )
  } catch {
    return NextResponse.json(
      { error: 'Error handler itself encountered an error' },
      { status: 500 }
    )
  }
}
