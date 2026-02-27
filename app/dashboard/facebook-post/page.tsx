"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function FacebookPostPage() {
    const [imageUrl, setImageUrl] = useState("")
    const [caption, setCaption] = useState("")
    const [loading, setLoading] = useState(false)
    const [successData, setSuccessData] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!imageUrl.trim()) {
            setErrorMsg("Image URL is required.")
            return
        }

        setLoading(true)
        setErrorMsg(null)
        setSuccessData(null)

        try {
            const response = await fetch('/api/facebook/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl,
                    caption
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                // Formulate a readable error from the raw Graph API payload if possible
                const apiError = data.error?.error?.message || data.error || 'Failed to publish post to Facebook.'
                throw new Error(typeof apiError === 'string' ? apiError : JSON.stringify(apiError))
            }

            setSuccessData({
                postId: data.postId,
                photoId: data.photoId
            })
            setImageUrl("")
            setCaption("")

        } catch (err: any) {
            console.error("Publishing error:", err)
            setErrorMsg(err.message || "An unexpected error occurred.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    Facebook Page Auto-Post
                </h1>
                <p className="text-muted-foreground mt-1">
                    Publish photos directly to your Facebook Page without exposing your access tokens.
                </p>
            </div>

            <Card className="glass border border-border/50 shadow-xl">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Send className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Create a Post</CardTitle>
                            <CardDescription>Fill out the details to send a photo to Facebook via the Graph API.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Status Messages */}
                        {successData && (
                            <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-lg text-neon-green flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Successfully published to Facebook!</p>
                                    <p className="text-sm opacity-80 font-mono mt-1">Post ID: {successData.postId}</p>
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold">Publishing Failed</p>
                                    <p className="text-sm mt-1 whitespace-pre-wrap">{errorMsg}</p>
                                </div>
                            </div>
                        )}

                        {/* Input Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    Image URL <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    className="glass"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Caption (Optional)</label>
                                <Textarea
                                    placeholder="Write a catchy caption for your page..."
                                    className="glass min-h-[120px]"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-500/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Publishing to Facebook...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Publish Post
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
