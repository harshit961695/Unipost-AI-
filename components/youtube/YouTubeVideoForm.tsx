"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Youtube, Sparkles, Loader2, Video, X, Image as ImageIcon, PlaySquare } from "lucide-react"

export function YouTubeVideoForm() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [privacy, setPrivacy] = useState("public")
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const thumbnailInputRef = useRef<HTMLInputElement>(null)

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

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.')
                return
            }
            setThumbnailFile(file)
            setThumbnailPreviewUrl(URL.createObjectURL(file))
        }
    }

    const generateAIText = async (type: 'title' | 'long_desc') => {
        setAiGenerating(true)
        try {
            const prompt = type === 'title' ? (title || 'Create a catchy Youtube video title') : (desc || 'Create a detailed description for a YouTube video')
            const response = await fetch('/api/ai/caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, type }),
            })
            if (!response.ok) throw new Error('AI generation failed')
            const data = await response.json()
            if (type === 'title') setTitle(data.caption)
            else setDesc(data.caption)
        } catch (error) {
            alert('AI generation failed')
            console.error(error)
        } finally {
            setAiGenerating(false)
        }
    }

    const handlePublish = async () => {
        if (!videoFile) return alert('Video is required.')
        if (!title) return alert('Title is required.')
        if (!thumbnailFile) return alert('Thumbnail is required for long videos.')

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('video', videoFile)
            formData.append('thumbnail', thumbnailFile)
            formData.append('title', title)
            formData.append('description', desc)
            formData.append('privacy', privacy)
            formData.append('postType', 'long_video')

            const response = await fetch('/api/publish/youtube', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error(await response.text())

            alert('Video Published Successfully!')
            setVideoFile(null)
            setVideoPreviewUrl(null)
            setThumbnailFile(null)
            setThumbnailPreviewUrl(null)
            setTitle('')
            setDesc('')
        } catch (error: any) {
            console.error('Publish Error:', error)
            alert(`Publish Failed: ${error.message}`)
        } finally {
            setIsPublishing(false)
        }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="space-y-6">
                <Card className="glass border-red-500/50">
                    <CardContent className="p-6 space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                            <Youtube className="w-5 h-5" /> Upload Long Video
                        </h3>

                        {/* Video Upload Dropzone */}
                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-white/5 transition-colors text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="video/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleVideoChange}
                                ref={fileInputRef}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <Video className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {videoFile ? videoFile.name : 'Click to browse 16:9 Video'}
                                </span>
                                <span className="text-xs">MP4, MOV</span>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Title <span className="text-red-500">*</span></label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => generateAIText('title')} disabled={aiGenerating} className="h-8 gap-2 text-primary">
                                    {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Magic
                                </Button>
                            </div>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Catchy title (under 100 chars)" className="glass" />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Description</label>
                                <Button type="button" variant="ghost" size="sm" onClick={() => generateAIText('long_desc')} disabled={aiGenerating} className="h-8 gap-2 text-primary">
                                    {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Magic
                                </Button>
                            </div>
                            <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detailed video description, timestamps and links..." className="min-h-[120px] resize-none glass" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Thumbnail */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Thumbnail <span className="text-red-500">*</span></label>
                                <div className="border border-dashed border-border/50 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5" onClick={() => thumbnailInputRef.current?.click()}>
                                    <input type="file" ref={thumbnailInputRef} onChange={handleThumbnailChange} className="hidden" accept="image/*" />
                                    <ImageIcon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{thumbnailFile ? thumbnailFile.name : 'Upload Image'}</span>
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Privacy Status</label>
                                <select
                                    className="w-full h-[74px] px-3 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-red-500 appearance-none"
                                    value={privacy}
                                    onChange={e => setPrivacy(e.target.value)}
                                >
                                    <option value="public">🌍 Public</option>
                                    <option value="unlisted">🔗 Unlisted</option>
                                    <option value="private">🔒 Private</option>
                                </select>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!videoFile || !title || !thumbnailFile || isPublishing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-lg shadow-lg"
                >
                    {isPublishing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing...</> : 'Publish Video to YouTube'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex flex-col gap-4">
                <label className="text-sm font-medium text-muted-foreground px-1">Video Player Preview</label>
                <div className="w-full max-w-[640px] aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative border border-zinc-800">
                    {videoPreviewUrl ? (
                        <video src={videoPreviewUrl} controls className="w-full h-full" />
                    ) : thumbnailPreviewUrl ? (
                        <img src={thumbnailPreviewUrl} alt="Thumbnail thumbnail" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                            <Video className="w-12 h-12 mb-2 opacity-50" />
                            <p className="font-medium">16:9 Video Preview</p>
                        </div>
                    )}

                    {/* YouTube Player Chrome Overlay (if not playing video) */}
                    {!videoPreviewUrl && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.7) 100%)' }}>
                            <div className="text-white font-semibold text-lg line-clamp-1 drop-shadow-md">{title || 'Video Title'}</div>
                            <div className="flex items-center gap-4 text-white p-2">
                                <PlaySquare className="w-6 h-6 drop-shadow-md" />
                                <div className="flex-1 h-1 bg-white/30 rounded-full"><div className="w-0 h-full bg-red-600 rounded-full"></div></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full max-w-[640px] space-y-2 mt-4">
                    <h2 className="text-xl font-bold">{title || 'Your Video Title Header'}</h2>
                    <div className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                        <span>12K views</span>
                        <span>•</span>
                        <span>2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden"><img src={`https://ui-avatars.com/api/?name=User`} alt="Avatar" className="w-full h-full object-cover" /></div>
                        <div>
                            <div className="font-semibold">Channel Name</div>
                            <div className="text-xs text-zinc-400">1.2M subscribers</div>
                        </div>
                        <Button variant="secondary" className="ml-auto rounded-full font-bold bg-white text-black hover:bg-zinc-200">Subscribe</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
