"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function RootLoading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative flex h-16 w-16 items-center justify-center"
                >
                    <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-xl"></div>
                    <Sparkles className="relative h-8 w-8 text-neon-cyan" />
                </motion.div>

                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        UniPost AI
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">
                        Loading...
                    </span>
                </div>
            </div>
        </div>
    );
}
