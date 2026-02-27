"use client"

import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Grid } from "lucide-react"
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

            const response = await fetch('/api/publish/instagram', {
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
                <Card className="glass border-border/50">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Grid className="w-5 h-5 text-[#E1306C]" />
                            Upload Post Image
                        </h3>

                        <div className="relative border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-white/5 transition-colors text-center cursor-pointer group">
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleImageChange}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                <ImageIcon className="w-8 h-8" />
                                <span className="font-medium text-sm">
                                    {imageFile ? imageFile.name : 'Click to browse 1:1 or 4:5 Image'}
                                </span>
                                <span className="text-xs">JPG, PNG up to 8MB</span>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-medium flex items-center justify-between">
                                Caption
                            </label>
                            <Textarea
                                placeholder="Write a captivating caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="min-h-[120px] resize-none glass"
                            />
                        </div>

                        <AICaptionGenerator type="post" onGenerate={setCaption} />

                    </CardContent>
                </Card>

                <Button
                    onClick={handlePublish}
                    disabled={!imageFile || isPublishing}
                    className="w-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold h-12 text-lg shadow-lg"
                >
                    {isPublishing ? 'Publishing Post...' : 'Publish to Instagram'}
                </Button>
            </div>

            {/* Preview Side */}
            <div className="flex justify-center items-start">
                <div className="w-[320px] bg-background border border-border rounded-xl overflow-hidden shadow-xl">
                    {/* Post Header */}
                    <div className="flex items-center gap-2 p-3 border-b border-border">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?name=User&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-sm">username</span>
                    </div>

                    {/* Post Image (Square 1:1 aspect ratio enforced in UI) */}
                    <div className="w-full aspect-square bg-zinc-900 flex items-center justify-center overflow-hidden">
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-12 h-12 text-zinc-600" />
                        )}
                    </div>

                    {/* Post Actions & Caption */}
                    <div className="p-3 space-y-2">
                        <div className="flex items-center gap-4 text-xl">
                            <span>♡</span>
                            <span>💬</span>
                            <span>↪</span>
                        </div>
                        <div className="font-semibold text-sm">1,234 likes</div>
                        <div className="text-sm text-foreground">
                            <span className="font-semibold mr-2">username</span>
                            <span className="whitespace-pre-wrap">{caption || 'Your caption will appear here...'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
