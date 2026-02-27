"use client"


import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReelUploader } from "./ReelUploader"
import { PostUploader } from "./PostUploader"
import { StoryUploader } from "./StoryUploader"
import { PlaySquare, Grid, History } from "lucide-react"
import { FacebookLayout, FacebookIcon } from "./FacebookLayout"

export function FacebookTabs() {
    return (
        <FacebookLayout>
            <div className="w-full space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                        <FacebookIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-sans tracking-tight">Facebook Studio</h2>
                        <p className="text-sm text-muted-foreground">Select content format</p>
                    </div>
                </div>

                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full flex justify-around bg-transparent border-b border-border/40 rounded-none h-14 mb-8">
                        <TabsTrigger
                            value="posts"
                            className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none transition-all"
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <Grid className="w-4 h-4" /> Posts
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="reels"
                            className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none transition-all"
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <PlaySquare className="w-4 h-4" /> Reels
                            </div>
                        </TabsTrigger>
                        <TabsTrigger
                            value="stories"
                            className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=active]:bg-transparent rounded-none transition-all"
                        >
                            <div className="flex items-center gap-2 font-semibold">
                                <History className="w-4 h-4" /> Stories
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        <TabsContent value="posts" className="mt-0">
                            <PostUploader />
                        </TabsContent>
                        <TabsContent value="reels" className="mt-0">
                            <ReelUploader />
                        </TabsContent>
                        <TabsContent value="stories" className="mt-0">
                            <StoryUploader />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </FacebookLayout>
    )
}
