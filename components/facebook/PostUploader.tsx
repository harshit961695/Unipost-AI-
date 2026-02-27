"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Grid, ThumbsUp, MessageCircle, Share2, Globe } from "lucide-react"
import { AICaptionGenerator } from "./AICaptionGenerator"

export function PostUploader() {
    const [caption, setCaption] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
    const [isPublishing, setIsPublishing] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.')
                return
            }
            setImageFile(file)
            setImagePreviewUrl(URL.createObjectURL(file))
        }
    }

    const handlePublish = async () => {
        if (!imageFile) return alert('Image is required.')

        setIsPublishing(true)
        try {
            const formData = new FormData()
            formData.append('media', imageFile)
            formData.append('caption', caption)
            formData.append('type', 'post')

            const response = await fetch('/api/publish/facebook', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            alert('Post Published Successfully!')
            setImageFile(null)
            setImagePreviewUrl(null)
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
                <Card className="glass border-border/50 shadow-sm">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Grid className="w-5 h-5 text-blue-600" />
                            Create Facebook Post
                        </h3>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-blue-50/5 hover:border-blue-500/50 transition-all text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleImageChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-blue-500 transition-colors">
                                <ImageIcon className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {imageFile ? imageFile.name : 'Click to browse Image'}
                                </span>
                                <span className="text-xs">JPG, PNG</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-medium flex items-center justify-between">
                                Post Content
                            </label>
                            <Textarea
                                placeholder="What's on your mind?"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="min-h-[120px] resize-none glass focus-visible:ring-blue-500"
                            />
                        </div>

                        <AICaptionGenerator type="post" onGenerate={setCaption} />

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!imageFile || isPublishing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-lg transition-colors"
                >
                    {isPublishing ? 'Publishing Post...' : 'Publish to Facebook'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                <div className="w-full max-w-[400px] bg-background border border-border rounded-xl overflow-hidden shadow-xl">
                    {/* Post Header */}
                    <div className="flex items-center gap-3 p-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden ring-1 ring-border">
                            <img src={`https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm hover:underline cursor-pointer">Your Page Name</span>
                            <div className="flex items-center text-xs text-muted-foreground gap-1">
                                <span>Just now</span>
                                <span>·</span>
                                <Globe className="w-3 h-3" />
                            </div>
                        </div>
                    </div>

                    {/* Post Caption */}
                    <div className="px-4 pb-3 text-sm whitespace-pre-wrap">
                        {caption || 'What\'s on your mind?'}
                    </div>

                    {/* Post Image */}
                    <div className="w-full min-h-[250px] bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Preview" className="w-full h-auto object-cover max-h-[500px]" />
                        ) : (
                            <ImageIcon className="w-12 h-12 text-zinc-600" />
                        )}
                    </div>

                    {/* Post Stats */}
                    <div className="px-4 py-2 border-b border-border text-xs text-muted-foreground flex justify-between">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                                <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                            <span>1.2K</span>
                        </div>
                        <div className="flex gap-3">
                            <span>123 comments</span>
                            <span>45 shares</span>
                        </div>
                    </div>

                    {/* Post Actions */}
                    <div className="flex px-2 py-1">
                        <Button variant="ghost" className="flex-1 rounded-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 gap-2">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Like</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 gap-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>Comment</span>
                        </Button>
                        <Button variant="ghost" className="flex-1 rounded-sm text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 h-9 gap-2">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
