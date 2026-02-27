"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Video, PlaySquare, Play, Pause, Volume2, VolumeX, ThumbsUp, MessageCircle, Share2, Globe } from "lucide-react"
import { AICaptionGenerator } from "./AICaptionGenerator"

export function ReelUploader() {
    const [caption, setCaption] = useState('')
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith('video/')) {
                alert('Please select a valid video file.')
                return
            }
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl)
            }
            setVideoFile(file)
            setVideoPreviewUrl(URL.createObjectURL(file))
            setIsPlaying(false)
        }
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
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

            const response = await fetch('/api/publish/facebook', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            alert('Reel Published Successfully!')
            setVideoFile(null)
            if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl)
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="space-y-6">
                <Card className="glass border-border/50 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <PlaySquare className="w-5 h-5 text-blue-600" />
                            Upload Facebook Reel
                        </h3>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-blue-50/5 hover:border-blue-500/50 transition-all text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="video/mp4,video/quicktime"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleVideoChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-blue-500 transition-colors">
                                <Video className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {videoFile ? videoFile.name : 'Click to browse 9:16 Video'}
                                </span>
                                <span className="text-xs">MP4, MOV up to 1GB</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-medium flex items-center justify-between">
                                Reel Description
                            </label>
                            <Textarea
                                placeholder="Describe your reel..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="min-h-[120px] resize-none glass focus-visible:ring-blue-500"
                            />
                        </div>

                        <AICaptionGenerator type="reel" onGenerate={setCaption} />

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!videoFile || isPublishing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-lg transition-colors"
                >
                    {isPublishing ? 'Publishing Reel...' : 'Publish to Facebook'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                <div className="w-[320px] h-[580px] bg-black rounded-xl overflow-hidden shadow-2xl relative border border-zinc-800">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                        <div className="text-white font-bold text-lg drop-shadow-md">Reels</div>
                    </div>

                    {/* Video Player Area */}
                    {videoPreviewUrl ? (
                        <div className="w-full h-full relative" onClick={togglePlay}>
                            <video
                                ref={videoRef}
                                src={videoPreviewUrl}
                                className="w-full h-full object-cover"
                                loop
                                playsInline
                                muted={isMuted}
                            />
                            {/* Play/Pause Overlay */}
                            <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                <Play className="w-16 h-16 text-white drop-shadow-lg" fill="white" />
                            </div>

                            {/* Mute toggle button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                className="absolute top-4 right-4 z-30 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                            <Video className="w-16 h-16" />
                            <span className="text-sm font-medium">Video Preview</span>
                        </div>
                    )}

                    {/* Bottom Info Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex gap-3">
                        {/* Profile Info & Caption */}
                        <div className="flex-1 flex flex-col justify-end text-white pb-2 overflow-hidden">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img src={`https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <span className="font-semibold text-sm drop-shadow-md">Your Page Name</span>
                                <Button variant="secondary" className="h-6 text-[10px] px-2 ml-1 bg-transparent border border-white text-white hover:bg-white/20">Follow</Button>
                            </div>
                            <p className="text-sm drop-shadow-md line-clamp-2 max-w-[85%]">{caption || 'Write a caption...'}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs opacity-90">
                                <span className="bg-white/20 px-2 py-0.5 rounded-sm">Original Audio</span>
                            </div>
                        </div>

                        {/* Right Actions Toolbar */}
                        <div className="flex flex-col justify-end items-center gap-4 pb-2">
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-black/40 transition-colors">
                                    <ThumbsUp className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium drop-shadow-md">1.2K</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-black/40 transition-colors">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium drop-shadow-md">45</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer">
                                <div className="bg-black/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-black/40 transition-colors">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-white text-xs font-medium drop-shadow-md">Share</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 mt-2">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white/50 animate-spin-slow">
                                    <img src="https://ui-avatars.com/api/?name=Audio&background=333&color=fff" className="w-full h-full object-cover" alt="Audio" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
