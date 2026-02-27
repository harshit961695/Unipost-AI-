"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Image as ImageIcon, History, Layers } from "lucide-react"

export function StoryUploader() {
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreviewUrl(URL.createObjectURL(file))
        }
    }

    const handlePublish = async () => {
        if (!imageFile) return alert('Media is required.')

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('media', imageFile)
            formData.append('type', 'story')

            const response = await fetch('/api/publish/facebook', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            alert('Story Published Successfully!')
            setImageFile(null)
            setImagePreviewUrl(null)
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
                <Card className="glass border-border/50 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-600" />
                            Create Facebook Story
                        </h3>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-blue-50/5 hover:border-blue-500/50 transition-all text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,video/mp4"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleMediaChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-blue-500 transition-colors">
                                <Layers className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {imageFile ? imageFile.name : 'Click to browse 9:16 Photo or Video'}
                                </span>
                                <span className="text-xs">JPG, PNG, MP4 up to 50MB</span>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-3 border border-border/50">
                            <div className="max-w-md">
                                <p className="font-medium text-foreground mb-1">Story Publishing Info</p>
                                <p>Captions are not directly supported for Stories via the API in this demo. Your story will appear for 24 hours.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!imageFile || isPublishing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-lg transition-colors"
                >
                    {isPublishing ? 'Publishing Story...' : 'Publish to Facebook'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                {/* Story Container matches 9:16 approx */}
                <div className="w-[320px] h-[580px] bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800">

                    {/* Story ProgressBar Mock */}
                    <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                        <div className="h-0.5 bg-white/30 flex-1 rounded-full overflow-hidden">
                            <div className="h-full bg-white w-1/3 rounded-full"></div>
                        </div>
                    </div>

                    {/* Story Header */}
                    <div className="absolute top-6 left-3 right-3 flex justify-between items-center z-20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden ring-2 ring-blue-500">
                                <img src={`https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-white font-semibold text-sm drop-shadow-md">Your Page Name</span>
                            <span className="text-white/70 text-xs drop-shadow-md">2h</span>
                        </div>
                    </div>

                    {/* Story Media */}
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        {imagePreviewUrl ? (
                            imageFile?.type.startsWith('video/') ? (
                                <video src={imagePreviewUrl} className="w-full h-full object-cover" autoPlay loop muted />
                            ) : (
                                <img src={imagePreviewUrl} alt="Story Preview" className="w-full h-full object-cover" />
                            )
                        ) : (
                            <div className="text-zinc-600 flex flex-col items-center gap-4">
                                <History className="w-16 h-16 opacity-50" />
                                <span className="text-sm font-medium">Story Preview</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Input Area Mock */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex gap-3">
                        <div className="flex-1 h-10 border border-white/40 rounded-full flex items-center px-4 backdrop-blur-sm bg-black/20">
                            <span className="text-white/60 text-sm">Send message</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
