export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        await requireAuth(request);

        const body = await request.json();
        const { type } = body;

        if (!type || !['reel', 'post', 'story'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let prompt = '';

        if (type === 'reel') {
            prompt = `Act as an expert Facebook Social Media Manager. I am posting a short-form vertical video (Facebook Reel).
Write a viral, highly engaging caption optimized for the Facebook algorithm. 
The caption should include:
1. A strong, relatable hook in the first sentence to grab attention.
2. Short, punchy sentences that encourage interaction.
3. Good use of emojis.
4. A clear Call To Action (CTA) asking people to comment or share the reel.
5. Exactly 3-5 highly relevant hashtags separated by spaces at the very bottom.
Do not wrap the caption in quotes. Just return the raw text.`;
        } else if (type === 'post') {
            prompt = `Act as an expert Facebook Social Media Manager. I am posting an image to a Facebook page/profile.
Write a captivating, conversational caption optimized for Facebook engagement.
The caption should include:
1. An engaging opening thought or question to spark discussion.
2. A small, relatable story or descriptive context.
3. Conversational tone, not overly formal.
4. Good use of emojis.
5. A clear Call To Action (CTA) asking people to react, comment, or tag a friend.
6. Exactly 3-5 highly relevant hashtags separated by spaces at the very bottom.
Do not wrap the caption in quotes. Just return the raw text.`;
        } else if (type === 'story') {
            prompt = `Act as an expert Facebook Social Media Manager. I am posting a Facebook Story.
Write a very short, punchy sentence to overlay on the story image/video.
Keep it extremely concise (1-2 sentences max). Use a few emojis.
Ask a quick question or use a call to action. 
Do not wrap in quotes. Just return the raw text.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const captionText = response.text || '';

        return NextResponse.json({ caption: captionText });

    } catch (error: any) {
        console.error('AI Facebook Caption Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate caption' },
            { status: 500 }
        );
    }
}
