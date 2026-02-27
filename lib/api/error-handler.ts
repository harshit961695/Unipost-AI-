/**
 * Global API Error Handler
 * Provides consistent error handling for all API routes
 * Prevents 500 crashes from breaking the app
 */
import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  statusCode: number
  code?: string
  details?: any
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred',
  defaultStatus = 500
): NextResponse {
  let message = defaultMessage
  let statusCode = defaultStatus
  let code: string | undefined
  let details: any = undefined

  if (error instanceof Error) {
    message = error.message || defaultMessage
    
    // Check for specific error types
    if (error.message.includes('Authentication') || error.message.includes('auth')) {
      statusCode = 401
      code = 'AUTH_ERROR'
    } else if (error.message.includes('not found')) {
      statusCode = 404
      code = 'NOT_FOUND'
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      statusCode = 400
      code = 'VALIDATION_ERROR'
    } else if (error.message.includes('permission') || error.message.includes('forbidden')) {
      statusCode = 403
      code = 'FORBIDDEN'
    }
  } else if (typeof error === 'object' && error !== null) {
    const err = error as any
    message = err.message || err.error || defaultMessage
    statusCode = err.statusCode || err.status || defaultStatus
    code = err.code
    details = err.details
  }

  // Log error in production (but don't expose sensitive details)
  if (statusCode >= 500) {
    console.error('Server error:', {
      message,
      code,
      statusCode,
      // Only log stack in development
      ...(process.env.NODE_ENV === 'development' && error instanceof Error
        ? { stack: error.stack }
        : {}),
    })
  }

  // Don't expose internal error details in production
  const response: ApiError = {
    message: statusCode >= 500 && process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : message,
    statusCode,
  }

  if (code) {
    response.code = code
  }

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details
  }

  return NextResponse.json(
    { error: response.message, code: response.code },
    { status: response.statusCode }
  )
}

/**
 * Wrapper for API route handlers to catch errors
 */
export function withErrorHandler(
  handler: (request: any, context?: any) => Promise<NextResponse>
) {
  return async (request: any, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}

/**
 * Safe JSON parsing with error handling
 */
export async function safeJsonParse<T = any>(
  request: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await request.json()
    return { data, error: null }
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Invalid JSON in request body',
    }
  }
}
