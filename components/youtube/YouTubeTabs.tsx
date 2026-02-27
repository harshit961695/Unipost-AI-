"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { YouTubeShortForm } from "./YouTubeShortForm"
import { YouTubeVideoForm } from "./YouTubeVideoForm"
import { YouTubeContent } from "./YouTubeContent"
import { YouTubeAnalytics } from "./YouTubeAnalytics"
import { Youtube, Video, LayoutDashboard, BarChart3 } from "lucide-react"

export function YouTubeTabs() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg">
                    <Youtube className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-sans tracking-tight">YouTube Studio</h2>
                    <p className="text-sm text-muted-foreground">Manage your channel content and performance</p>
                </div>
            </div>

            <Tabs defaultValue="shorts" className="w-full">
                <TabsList className="w-full flex justify-around bg-transparent border-b border-border/40 rounded-none h-14 mb-8">
                    <TabsTrigger
                        value="shorts"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent rounded-none transition-all px-2"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <Youtube className="w-4 h-4" /> <span className="hidden sm:inline">Shorts</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="videos"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent rounded-none transition-all px-2"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <Video className="w-4 h-4" /> <span className="hidden sm:inline">Videos</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="content"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent rounded-none transition-all px-2"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Content</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="analytics"
                        className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent rounded-none transition-all px-2"
                    >
                        <div className="flex items-center gap-2 font-semibold">
                            <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Analytics</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="shorts" className="mt-0">
                        <YouTubeShortForm />
                    </TabsContent>
                    <TabsContent value="videos" className="mt-0">
                        <YouTubeVideoForm />
                    </TabsContent>
                    <TabsContent value="content" className="mt-0">
                        <YouTubeContent />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-0">
                        <YouTubeAnalytics />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}

