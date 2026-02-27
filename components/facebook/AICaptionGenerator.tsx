"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Check } from "lucide-react"

interface AICaptionGeneratorProps {
    onGenerate: (caption: string) => void;
    type: 'reel' | 'post' | 'story';
}

export function AICaptionGenerator({ onGenerate, type }: AICaptionGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setIsSuccess(false);

        try {
            const response = await fetch('/api/ai/facebook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });

            if (!response.ok) {
                throw new Error('Failed to generate caption');
            }

            const data = await response.json();
            onGenerate(data.caption);

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (error) {
            console.error('AI Generation Error:', error);
            // Fallback text if API fails during dev
            onGenerate(`Check out this amazing ${type} we just created! 🎉\n\nWhat are your thoughts? Drop a comment below! 👇\n\n#facebook${type} #community #trending`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-lg transition-all border border-blue-400/30"
        >
            {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...</>
            ) : isSuccess ? (
                <><Check className="w-4 h-4 mr-2" /> Generated!</>
            ) : (
                <><Sparkles className="w-4 h-4 mr-2 text-blue-200" /> Auto-Generate Caption</>
            )}
        </Button>
    );
}
