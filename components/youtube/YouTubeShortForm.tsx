"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Youtube, Sparkles, Loader2, Video, X } from "lucide-react"

export function YouTubeShortForm() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const generateAIText = async (type: 'title' | 'short_desc') => {
        setAiGenerating(true)
        try {
            const prompt = type === 'title' ? (title || 'Create a catchy Youtube short title') : (desc || 'Create a short description for a YouTube short')
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

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('video', videoFile)
            formData.append('title', title)
            formData.append('description', desc)
            formData.append('privacy', 'public')
            formData.append('postType', 'short')

            const response = await fetch('/api/publish/youtube', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error(await response.text())

            alert('Short Published Successfully!')
            setVideoFile(null)
            setVideoPreviewUrl(null)
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3 space-y-6">
                <Card className="glass border-red-500/50">
                    <CardContent className="p-6 space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 text-red-500">
                            <Youtube className="w-5 h-5" /> Upload YouTube Short
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
                                    {videoFile ? videoFile.name : 'Click to browse 9:16 Video'}
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
                                <Button type="button" variant="ghost" size="sm" onClick={() => generateAIText('short_desc')} disabled={aiGenerating} className="h-8 gap-2 text-primary">
                                    {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI Magic
                                </Button>
                            </div>
                            <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Include #shorts and relevant tags..." className="min-h-[120px] resize-none glass" />
                        </div>

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!videoFile || !title || isPublishing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-lg shadow-lg"
                >
                    {isPublishing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing...</> : 'Publish Short to YouTube'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="xl:col-span-2 flex justify-center items-start">
                <div className="w-[300px] h-[600px] bg-black rounded-[2.5rem] border-[8px] border-zinc-800 relative overflow-hidden shadow-2xl flex flex-col">
                    {videoPreviewUrl ? (
                        <video src={videoPreviewUrl} autoPlay loop muted className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <Video className="w-10 h-10 opacity-50" />
                            <span className="text-sm font-medium">Shorts Preview</span>
                        </div>
                    )}

                    <div className="absolute right-4 bottom-20 flex flex-col gap-6 text-white drop-shadow-md">
                        <div className="flex flex-col items-center gap-1"><span className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold">👍</span></div>
                        <div className="flex flex-col items-center gap-1"><span className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold">💬</span></div>
                        <div className="flex flex-col items-center gap-1"><span className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold">↪</span></div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-16 text-white drop-shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden"><img src={`https://ui-avatars.com/api/?name=User`} alt="Avatar" className="w-full h-full object-cover" /></div>
                            <span className="font-semibold text-sm">@channelname</span>
                            <span className="bg-red-600 text-[10px] px-2 py-0.5 rounded font-bold">SUBSCRIBE</span>
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{title || 'Your title will appear here'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
