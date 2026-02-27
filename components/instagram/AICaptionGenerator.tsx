"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, Check } from "lucide-react"

interface AICaptionGeneratorProps {
    onGenerate: (caption: string) => void;
    type: 'reel' | 'post';
}

export function AICaptionGenerator({ onGenerate, type }: AICaptionGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setIsSuccess(false);

        try {
            const response = await fetch('/api/ai/instagram', {
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
            onGenerate(`Check out this amazing ${type}! 🔥\n\nWhat do you guys think? Let me know below! 👇\n\n#trending #viral #contentcreator`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg transition-all"
        >
            {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Magic...</>
            ) : isSuccess ? (
                <><Check className="w-4 h-4 mr-2" /> Generated!</>
            ) : (
                <><Sparkles className="w-4 h-4 mr-2 text-yellow-300" /> Auto-Generate Caption</>
            )}
        </Button>
    );
}
