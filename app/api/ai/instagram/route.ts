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

        if (!type || !['reel', 'post'].includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        let prompt = '';

        if (type === 'reel') {
            prompt = `Act as an expert Instagram Social Media Manager. I am posting a short-form vertical video (Reel).
Write a viral, highly engaging caption. 
The caption should include:
1. A hook in the first sentence to grab attention.
2. Short, punchy sentences.
3. Good use of emojis.
4. A clear Call To Action (CTA) asking people to comment or save the reel.
5. Exactly 8-12 highly relevant and trending hashtags separated by spaces at the very bottom.
Do not wrap the caption in quotes. Just return the raw text.`;
        } else if (type === 'post') {
            prompt = `Act as an expert Instagram Social Media Manager. I am posting an image.
Write a captivating caption.
The caption should include:
1. An engaging opening thought.
2. A small story or descriptive context.
3. Good use of emojis.
4. A clear Call To Action (CTA) asking people to double-tap, comment, or tag a friend.
5. Exactly 8-12 highly relevant and trending hashtags separated by spaces at the very bottom.
Do not wrap the caption in quotes. Just return the raw text.`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const captionText = response.text || '';

        return NextResponse.json({ caption: captionText });

    } catch (error: any) {
        console.error('AI Instagram Caption Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate caption' },
            { status: 500 }
        );
    }
}
