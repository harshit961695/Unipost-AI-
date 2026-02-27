"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Video,
    Edit2,
    Trash2,
    ExternalLink,
    Search,
    Loader2,
    MoreVertical,
    Eye,
    ThumbsUp,
    MessageSquare,
    Check,
    X
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface YouTubeVideo {
    id: string
    snippet: {
        title: string
        description: string
        thumbnails: {
            medium: { url: string }
        }
        publishedAt: string
    }
    statistics: {
        viewCount: string
        likeCount: string
        commentCount: string
    }
    status: {
        privacyStatus: string
    }
}

export function YouTubeContent() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null)
    const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/youtube/videos')
            const data = await response.json()
            if (data.success) {
                setVideos(data.videos)
            }
        } catch (error) {
            console.error('Failed to fetch videos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!editingVideo) return
        setIsSaving(true)
        try {
            const response = await fetch(`/api/youtube/videos/${editingVideo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editingVideo.snippet.title,
                    description: editingVideo.snippet.description,
                    privacyStatus: editingVideo.status.privacyStatus
                })
            })
            if (response.ok) {
                setEditingVideo(null)
                fetchVideos()
            }
        } catch (error) {
            console.error('Failed to update video:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingVideoId) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/youtube/videos/${deletingVideoId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                setDeletingVideoId(null)
                fetchVideos()
            }
        } catch (error) {
            console.error('Failed to delete video:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredVideos = videos.filter(v =>
        v.snippet.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                <p className="text-muted-foreground font-medium">Loading your content...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your videos..."
                        className="pl-10 glass"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Showing {filteredVideos.length} videos
                </p>
            </div>

            {filteredVideos.length === 0 ? (
                <Card className="glass p-20 text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <h3 className="text-lg font-semibold">No videos found</h3>
                    <p className="text-muted-foreground">Try a different search or upload a new video.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVideos.map((video) => (
                        <Card key={video.id} className="glass group overflow-hidden border-border/40 hover:border-red-500/50 transition-all duration-300">
                            <div className="relative aspect-video overflow-hidden">
                                <img
                                    src={video.snippet.thumbnails.medium.url}
                                    alt={video.snippet.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 right-2 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="w-8 h-8 rounded-full shadow-lg"
                                        onClick={() => setEditingVideo(JSON.parse(JSON.stringify(video)))}
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="w-8 h-8 rounded-full shadow-lg"
                                        onClick={() => setDeletingVideoId(video.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                                    {video.status.privacyStatus}
                                </div>
                            </div>
                            <CardContent className="p-4 space-y-3">
                                <h4 className="font-semibold text-sm line-clamp-2 min-h-[40px] group-hover:text-red-500 transition-colors">
                                    {video.snippet.title}
                                </h4>

                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {Number(video.statistics.viewCount).toLocaleString()}</div>
                                        <div className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {Number(video.statistics.likeCount).toLocaleString()}</div>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-8 text-[11px] gap-2 border border-border/40 hover:bg-red-500/10 hover:text-red-500"
                                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                                >
                                    <ExternalLink className="w-3 h-3" /> View on YouTube
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
                <DialogContent className="glass">
                    <DialogHeader>
                        <DialogTitle>Edit Video Details</DialogTitle>
                        <DialogDescription>
                            Update your video&apos;s information. Changes will be synced to YouTube.
                        </DialogDescription>
                    </DialogHeader>
                    {editingVideo && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={editingVideo.snippet.title}
                                    onChange={(e) => setEditingVideo({
                                        ...editingVideo,
                                        snippet: { ...editingVideo.snippet, title: e.target.value }
                                    })}
                                    className="glass"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editingVideo.snippet.description}
                                    onChange={(e) => setEditingVideo({
                                        ...editingVideo,
                                        snippet: { ...editingVideo.snippet, description: e.target.value }
                                    })}
                                    className="glass min-h-[120px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Visibility</label>
                                <select
                                    className="w-full p-2 rounded-md bg-secondary border border-border/40 glass text-sm"
                                    value={editingVideo.status.privacyStatus}
                                    onChange={(e) => setEditingVideo({
                                        ...editingVideo,
                                        status: { ...editingVideo.status, privacyStatus: e.target.value }
                                    })}
                                >
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingVideo(null)} className="glass">Cancel</Button>
                        <Button onClick={handleUpdate} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deletingVideoId} onOpenChange={() => setDeletingVideoId(null)}>
                <DialogContent className="glass border-red-500/50">
                    <DialogHeader>
                        <DialogTitle className="text-red-500">Delete Video?</DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone. The video will be removed from YouTube.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingVideoId(null)} className="glass">Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
