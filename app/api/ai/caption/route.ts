export const dynamic = 'force-dynamic'
/**
 * AI Caption Generation API Route
 * POST /api/ai/caption
 * 
 * Generates social media captions using Google Gemini AI
 * Uses centralized aiService for stability and error handling
 */
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/services/aiService'

export async function POST(request: NextRequest) {
  try {
    // Parse request body safely
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { prompt, type } = body

    // Generate caption using service
    const result = await aiService.generateCaption(prompt, type)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Unexpected error in AI caption endpoint:', error)

    // Final safety net fallback
    return NextResponse.json({
      caption: aiService.generateFallbackCaption(''),
      fallback: true,
      message: 'Critical error in AI service'
    })
  }
}
