"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Video, Hash, PlaySquare } from "lucide-react"
import { AICaptionGenerator } from "./AICaptionGenerator"

export function ReelUploader() {
    const [caption, setCaption] = useState('')
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith('video/')) {
                alert('Please select a valid video file.')
                return
            }
            setVideoFile(file)
            setVideoPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handlePublish = async () => {
        if (!videoFile) return alert('Video is required.')

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('media', videoFile)
            formData.append('caption', caption)
            formData.append('type', 'reel')

            const response = await fetch('/api/publish/instagram', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            alert('Reel Published Successfully!')
            // Reset form
            setVideoFile(null)
            setVideoPreviewUrl(null)
            setCaption('')
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
                            <PlaySquare className="w-5 h-5 text-[#E1306C]" />
                            Upload Reel Video
                        </h3>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-white/5 transition-colors text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="video/mp4,video/quicktime"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleVideoChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <Video className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {videoFile ? videoFile.name : 'Click to browse 9:16 Video'}
                                </span>
                                <span className="text-xs">MP4, MOV up to 100MB</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-medium flex items-center justify-between">
                                Caption
                            </label>
                            <Textarea
                                placeholder="Write a catchy caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="min-h-[120px] resize-none glass"
                            />
                        </div>

                        <AICaptionGenerator type="reel" onGenerate={setCaption} />

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!videoFile || isPublishing}
                    className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold h-12 text-lg shadow-lg"
                >
                    {isPublishing ? 'Publishing Reel...' : 'Publish to Instagram'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                <div className="w-[300px] h-[600px] bg-black rounded-[2.5rem] border-[8px] border-zinc-800 relative overflow-hidden shadow-2xl flex flex-col">
                    {videoPreviewUrl ? (
                        <video
                            src={videoPreviewUrl}
                            autoPlay
                            loop
                            muted
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <PlaySquare className="w-10 h-10 opacity-50" />
                            <span className="text-sm font-medium">Reel Preview</span>
                        </div>
                    )}

                    {/* Instagram UI Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-semibold text-sm">username</span>
                        </div>

                        <div className="text-sm max-h-[80px] overflow-hidden relative">
                            <p className="whitespace-pre-wrap text-sm line-clamp-2">
                                {caption || 'Your caption will appear here...'}
                            </p>
                        </div>
                    </div>

                    {/* Side Icons */}
                    <div className="absolute right-4 bottom-20 flex flex-col gap-4 text-white drop-shadow-md">
                        <div className="flex flex-col items-center gap-1"><span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">♡</span></div>
                        <div className="flex flex-col items-center gap-1"><span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">💬</span></div>
                        <div className="flex flex-col items-center gap-1"><span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">↪</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
