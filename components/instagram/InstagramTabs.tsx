"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReelUploader } from "./ReelUploader"
import { PostUploader } from "./PostUploader"
import { StoryUploader } from "./StoryUploader"
import { PlaySquare, Grid, History } from "lucide-react"

export function InstagramTabs() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center">
                    <InstagramIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-sans tracking-tight">Instagram Studio</h2>
                    <p className="text-sm text-muted-foreground">Select content format</p>
                </div>
            </div>

            <Tabs defaultValue="reels" className="w-full">
                <TabsList className="w-full flex justify-around bg-transparent border-b border-border/40 rounded-none h-14 mb-8">
                    <TabsTrigger
                        value="reels"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-all"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <PlaySquare className="w-4 h-4" /> Reels
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="posts"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-all"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <Grid className="w-4 h-4" /> Posts
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="stories"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none transition-all"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <History className="w-4 h-4" /> Stories
                        </div>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="reels" className="mt-0">
                        <ReelUploader />
                    </TabsContent>
                    <TabsContent value="posts" className="mt-0">
                        <PostUploader />
                    </TabsContent>
                    <TabsContent value="stories" className="mt-0">
                        <StoryUploader />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}
