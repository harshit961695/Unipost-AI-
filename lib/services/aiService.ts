import { GoogleGenAI } from '@google/genai'

export const aiService = {
    /**
     * Generate a social media caption or metadata using Gemini
     */
    async generateCaption(prompt: string, type?: 'title' | 'long_desc' | 'short_desc' | 'default'): Promise<{ caption: string; fallback: boolean; message?: string }> {
        const trimmedPrompt = prompt?.trim()

        // 1. Validation
        if (!trimmedPrompt) {
            return {
                caption: this.generateFallbackCaption(''),
                fallback: true,
                message: 'Empty prompt provided'
            }
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is missing')
            return {
                caption: this.generateFallbackCaption(trimmedPrompt),
                fallback: true,
                message: 'AI configuration missing'
            }
        }

        // 2. Client Initialization
        let ai: GoogleGenAI
        try {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        } catch (error) {
            console.error('Failed to initialize Gemini client:', error)
            return {
                caption: this.generateFallbackCaption(trimmedPrompt),
                fallback: true,
                message: 'AI Service initialization failed'
            }
        }

        // 3. Generation with Retry
        try {
            const caption = await this.generateWithRetry(ai, trimmedPrompt, type)
            if (caption) {
                return { caption, fallback: false }
            }
            throw new Error('Empty response from AI')
        } catch (error: any) {
            console.error('AI Generation failed:', error)
            return {
                caption: this.generateFallbackCaption(trimmedPrompt),
                fallback: true,
                message: 'AI generation failed, using fallback'
            }
        }
    },

    /**
     * Core generation logic with 1 retry
     */
    async generateWithRetry(ai: GoogleGenAI, prompt: string, type: 'title' | 'long_desc' | 'short_desc' | 'default' = 'default', retryCount = 0): Promise<string | null> {
        try {
            let fullPrompt = `Create an engaging social media caption for Instagram and YouTube based on this idea: ${prompt}. Keep it concise, engaging, and under 220 characters.`

            if (type === 'title') {
                fullPrompt = `Generate a catchy YouTube video title based on this idea: ${prompt}. Rules: Exactly 1 line, absolutely NO quotation marks, NO emojis.`
            } else if (type === 'long_desc') {
                fullPrompt = `Write a detailed YouTube video description based on this idea: ${prompt}. Rules: Write approximately 150 words. Make it engaging and informative.`
            } else if (type === 'short_desc') {
                fullPrompt = `Write a short YouTube Shorts description based on this idea: ${prompt}. Rules: Keep it strictly under 80 words. Make it punchy.`
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash', // Updated to latest stable model or use 'gemini-pro'
                contents: fullPrompt,
            })

            const text = response.text
            return text && text.trim().length > 0 ? text.trim() : null
        } catch (error) {
            if (retryCount === 0) {
                console.log('Retrying AI generation...')
                await new Promise(r => setTimeout(r, 1000))
                return this.generateWithRetry(ai, prompt, type, 1)
            }
            throw error
        }
    },

    /**
     * Deterministic fallback generator
     */
    generateFallbackCaption(prompt: string): string {
        if (!prompt) return "🚀 Exciting news! Stay tuned for more updates. #content #socialmedia"

        const words = prompt.split(/\s+/).slice(0, 10).join(' ')
        const emojis = ['✨', '🚀', '💫', '🌟', '🎯']
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

        return `${randomEmoji} ${words}... #content #socialmedia #update`
    }
}
