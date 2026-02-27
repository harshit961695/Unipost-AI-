"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Camera, History } from "lucide-react"

export function StoryUploader() {
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith('video/') && !file.type.startsWith('image/')) {
                alert('Please select a valid image or video file.')
                return
            }
            setMediaFile(file)
            setMediaPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handlePublish = async () => {
        if (!mediaFile) return alert('Media is required for a story.')

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('media', mediaFile)
            formData.append('type', 'story')

            const response = await fetch('/api/publish/instagram', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            alert('Story Published Successfully!')
            setMediaFile(null)
            setMediaPreviewUrl(null)
        } catch (error: any) {
            console.error('Publish Error:', error)
            alert(`Publish Failed: ${error.message}`)
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="space-y-6">
                <Card className="glass border-border/50">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <History className="w-5 h-5 text-[#E1306C]" />
                            Upload Story Media
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            Stories don&apos;t require captions. Just upload an engaging 9:16 image or short video!
                        </p>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-white/5 transition-colors text-center cursor-pointer group mt-4">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,video/mp4,video/quicktime"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleMediaChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <Camera className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {mediaFile ? mediaFile.name : 'Click to browse 9:16 Media'}
                                </span>
                                <span className="text-xs">JPG, PNG, or MP4</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!mediaFile || isPublishing}
                    className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold h-12 text-lg shadow-lg"
                >
                    {isPublishing ? 'Publishing Story...' : 'Publish to Instagram Story'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                <div className="w-[300px] h-[600px] bg-black rounded-[2.5rem] border-[8px] border-zinc-800 relative overflow-hidden shadow-2xl flex flex-col">
                    {mediaPreviewUrl ? (
                        mediaFile?.type.startsWith('image') ? (
                            <img src={mediaPreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <video src={mediaPreviewUrl} autoPlay loop muted className="w-full h-full object-cover" />
                        )
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <Camera className="w-10 h-10 opacity-50" />
                            <span className="text-sm font-medium">Story Preview</span>
                        </div>
                    )}

                    {/* Story UI Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex items-center gap-2">
                        {/* Progress Bars Placeholder */}
                        <div className="absolute top-2 left-2 right-2 flex gap-1">
                            <div className="h-1 bg-white/30 flex-1 rounded-full"><div className="w-1/2 h-full bg-white rounded-full"></div></div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden mt-2">
                            <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-sm text-white mt-2 drop-shadow">username</span>
                        <span className="text-xs text-white/80 mt-2 ml-1 drop-shadow">1m</span>
                    </div>

                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <div className="px-6 py-2 rounded-full border border-white/40 bg-black/20 backdrop-blur-sm text-white text-sm">
                            Send message
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
