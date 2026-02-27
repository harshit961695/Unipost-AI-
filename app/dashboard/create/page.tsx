"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Instagram, Youtube, Facebook, CheckCircle2, XCircle, Loader2, Image as ImageIcon, Video, Wand2, AlertCircle } from "lucide-react"

type PlatformConfig = {
  enabled: boolean;
  type: string;
  caption?: string;
  title?: string;
  description?: string;
  privacy?: string;
  mediaFile: File | null;
  thumbnailFile?: File | null;
  mediaPreview: string | null;
  thumbnailPreview?: string | null;
}

const defaultPlatformState: Record<string, PlatformConfig> = {
  facebook: { enabled: false, type: 'post', caption: '', mediaFile: null, mediaPreview: null },
  instagram: { enabled: false, type: 'post', caption: '', mediaFile: null, mediaPreview: null },
  youtube: { enabled: false, type: 'video', title: '', description: '', privacy: 'private', mediaFile: null, mediaPreview: null, thumbnailFile: null, thumbnailPreview: null }
}

export default function CreatePostPage() {
  const [platforms, setPlatforms] = useState(defaultPlatformState)
  const [isPublishing, setIsPublishing] = useState(false)
  const [results, setResults] = useState<{ platform: string, status: 'success' | 'failure', error?: string }[] | null>(null)

  const updatePlatform = (platform: string, key: keyof PlatformConfig, value: any) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value }
    }))
    setResults(null)
  }

  const handleMediaChange = (platform: string, isThumbnail: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const previewUrl = URL.createObjectURL(file)

      if (isThumbnail) {
        updatePlatform(platform, 'thumbnailFile', file)
        updatePlatform(platform, 'thumbnailPreview', previewUrl)
      } else {
        updatePlatform(platform, 'mediaFile', file)
        updatePlatform(platform, 'mediaPreview', previewUrl)
      }
    }
  }

  const generateAIContent = async (platform: string, type: 'caption' | 'title' | 'description') => {
    // Mock AI generation for UX demonstration
    const prompt = platforms[platform].caption || platforms[platform].title || "A cool new update"
    updatePlatform(platform, type, `Generating ${type} for ${prompt}... (AI Mock) \n\n#socialmedia #update`)
  }

  // Calculate dynamic validation errors
  const enabledPlatforms = Object.keys(platforms).filter(p => platforms[p].enabled)
  const validationErrors: Record<string, string> = {}

  if (platforms.youtube.enabled && (!platforms.youtube.mediaFile || !platforms.youtube.mediaFile.type.startsWith('video'))) {
    validationErrors.youtube = "Video required for YouTube"
  }
  if (platforms.instagram.enabled && !platforms.instagram.mediaFile) {
    validationErrors.instagram = "Media required for Instagram"
  }
  if (platforms.facebook.enabled && platforms.facebook.type !== 'post' && !platforms.facebook.mediaFile) {
    validationErrors.facebook = "Media required for Facebook Reels/Stories"
  }

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const canPublish = enabledPlatforms.length > 0 && !hasValidationErrors && !isPublishing;

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsPublishing(true)
    setResults(null)

    try {
      const formData = new FormData()

      // Construct exact metadata JSON required by new backend
      const metadataPayload: any = {}

      enabledPlatforms.forEach(p => {
        const conf = platforms[p]
        metadataPayload[p] = {
          enabled: conf.enabled,
          type: conf.type,
          caption: conf.caption,
          title: conf.title,
          description: conf.description,
          privacy: conf.privacy
        }
        if (conf.mediaFile) formData.append(`media_${p}`, conf.mediaFile)
        if (conf.thumbnailFile) formData.append(`thumbnail_${p}`, conf.thumbnailFile)
      })

      formData.append('metadata', JSON.stringify(metadataPayload))

      const response = await fetch('/api/publish', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish')
      }

      const formattedResults = enabledPlatforms.map(p => ({
        platform: p,
        status: data.results[p] || 'failure',
        error: data.errors?.[p]
      }))

      setResults(formattedResults as any)

    } catch (error: any) {
      console.error('Publish Error:', error)
      alert(`Publish Failed: ${error.message} `)
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          Multi-Platform Publisher
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize and publish content to multiple social accounts simultaneously.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area - Accordion Builders */}
        <div className="lg:col-span-2 space-y-6">
          <Accordion type="multiple" defaultValue={["facebook"]} className="w-full space-y-4">

            {/* FACEBOOK SECTION */}
            <AccordionItem value="facebook" className="border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-6 hover:bg-muted/50 data-[state=open]:bg-muted/20">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Facebook</span>
                    {validationErrors.facebook && (
                      <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <Switch
                      checked={platforms.facebook.enabled}
                      onCheckedChange={(c) => updatePlatform('facebook', 'enabled', c)}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 space-y-6 border-t bg-muted/5">
                {validationErrors.facebook && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.facebook}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post Type</label>
                    <Select value={platforms.facebook.type} onValueChange={(v) => updatePlatform('facebook', 'type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Standard Post</SelectItem>
                        <SelectItem value="reel">Reel (Video)</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Caption</label>
                    <Button variant="ghost" size="sm" onClick={() => generateAIContent('facebook', 'caption')} className="h-8 text-xs text-neon-cyan gap-1">
                      <Wand2 className="w-3 h-3" /> AI Generate
                    </Button>
                  </div>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={platforms.facebook.caption}
                    onChange={(e) => updatePlatform('facebook', 'caption', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${validationErrors.facebook ? 'text-red-500' : ''}`}>Media (Optional for Posts)</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center min-h-[150px] ${validationErrors.facebook ? 'border-red-500/50 bg-red-500/5' : 'hover:border-blue-500/50'}`}>
                    <input type="file" accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleMediaChange('facebook', false, e)} />
                    {platforms.facebook.mediaPreview ? (
                      platforms.facebook.mediaFile?.type.startsWith('video') ? <video src={platforms.facebook.mediaPreview} className="max-h-[200px] rounded-lg" controls /> : <img src={platforms.facebook.mediaPreview} className="max-h-[200px] rounded-lg" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon className="w-6 h-6" /><span>Upload Media</span></div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* INSTAGRAM SECTION */}
            <AccordionItem value="instagram" className="border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-6 hover:bg-muted/50 data-[state=open]:bg-muted/20">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg">Instagram</span>
                    {validationErrors.instagram && (
                      <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <Switch
                      checked={platforms.instagram.enabled}
                      onCheckedChange={(c) => updatePlatform('instagram', 'enabled', c)}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 space-y-6 border-t bg-muted/5">
                {validationErrors.instagram && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.instagram}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Post Type</label>
                    <Select value={platforms.instagram.type} onValueChange={(v) => updatePlatform('instagram', 'type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="post">Image Post</SelectItem>
                        <SelectItem value="reel">Reel (Video)</SelectItem>
                        <SelectItem value="story">Story</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Caption</label>
                    <Button variant="ghost" size="sm" onClick={() => generateAIContent('instagram', 'caption')} className="h-8 text-xs gap-1 text-pink-400">
                      <Wand2 className="w-3 h-3" /> AI Generate
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Write an engaging caption..."
                    value={platforms.instagram.caption}
                    onChange={(e) => updatePlatform('instagram', 'caption', e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-sm font-medium ${validationErrors.instagram ? 'text-red-500' : 'text-pink-500'}`}>Media (Required)</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center min-h-[150px] ${validationErrors.instagram ? 'border-red-500/50 bg-red-500/5' : 'hover:border-pink-500/50'}`}>
                    <input type="file" accept="image/*,video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleMediaChange('instagram', false, e)} />
                    {platforms.instagram.mediaPreview ? (
                      platforms.instagram.mediaFile?.type.startsWith('video') ? <video src={platforms.instagram.mediaPreview} className="max-h-[200px] rounded-lg" controls /> : <img src={platforms.instagram.mediaPreview} className="max-h-[200px] rounded-lg" alt="Preview" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon className="w-6 h-6" /><span>Upload Image or Video</span></div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* YOUTUBE SECTION */}
            <AccordionItem value="youtube" className="border rounded-xl bg-card overflow-hidden">
              <AccordionTrigger className="px-6 hover:bg-muted/50 data-[state=open]:bg-muted/20">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-lg">YouTube</span>
                    {validationErrors.youtube && (
                      <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </div>
                  <div onClick={e => e.stopPropagation()}>
                    <Switch
                      checked={platforms.youtube.enabled}
                      onCheckedChange={(c) => updatePlatform('youtube', 'enabled', c)}
                    />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 space-y-6 border-t bg-muted/5">
                {validationErrors.youtube && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {validationErrors.youtube}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Type</label>
                    <Select value={platforms.youtube.type} onValueChange={(v) => updatePlatform('youtube', 'type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">Standard Video</SelectItem>
                        <SelectItem value="short">YouTube Short</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Privacy Settings</label>
                    <Select value={platforms.youtube.privacy} onValueChange={(v) => updatePlatform('youtube', 'privacy', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="unlisted">Unlisted</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Video Title</label>
                    <Button variant="ghost" size="sm" onClick={() => generateAIContent('youtube', 'title')} className="h-8 text-xs gap-1 text-red-400">
                      <Wand2 className="w-3 h-3" /> AI Title
                    </Button>
                  </div>
                  <Input
                    placeholder="Catchy video title..."
                    value={platforms.youtube.title}
                    onChange={(e) => updatePlatform('youtube', 'title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Description</label>
                    <Button variant="ghost" size="sm" onClick={() => generateAIContent('youtube', 'description')} className="h-8 text-xs gap-1 text-red-400">
                      <Wand2 className="w-3 h-3" /> AI Desc
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Video description and links..."
                    value={platforms.youtube.description}
                    onChange={(e) => updatePlatform('youtube', 'description', e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${validationErrors.youtube ? 'text-red-500' : 'text-red-500'}`}>Video File (Required)</label>
                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center min-h-[150px] ${validationErrors.youtube ? 'border-red-500/50 bg-red-500/5' : 'hover:border-red-500/50'}`}>
                      <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleMediaChange('youtube', false, e)} />
                      {platforms.youtube.mediaPreview ? (
                        <video src={platforms.youtube.mediaPreview} className="max-h-[120px] rounded-lg" controls />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground"><Video className="w-6 h-6" /><span>Upload MP4</span></div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail (Optional)</label>
                    <div className="relative border-2 border-dashed rounded-xl p-4 hover:border-red-500/50 transition-all text-center flex flex-col items-center justify-center min-h-[150px]">
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleMediaChange('youtube', true, e)} />
                      {platforms.youtube.thumbnailPreview ? (
                        <img src={platforms.youtube.thumbnailPreview} className="max-h-[120px] rounded-lg object-cover" alt="Thumb" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon className="w-6 h-6" /><span>Upload Image</span></div>
                      )}
                    </div>
                  </div>
                </div>

              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        {/* Sidebar Summary & Publish Area */}
        <div className="space-y-6">
          <Card className="glass sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle>Publish Summary</CardTitle>
              <CardDescription>Review your selected platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['facebook', 'instagram', 'youtube'].map(p => {
                  const isEnabled = platforms[p].enabled;
                  return (
                    <div key={p} className={`flex items - center justify - between p - 3 rounded - lg border ${isEnabled ? 'bg-muted/50 border-neon-cyan/50' : 'bg-transparent border-border/50 opacity-50'} `}>
                      <span className="capitalize font-medium">{p}</span>
                      {isEnabled ? <CheckCircle2 className="w-4 h-4 text-neon-cyan" /> : <div className="w-4 h-4 rounded-full border border-muted-foreground" />}
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={handlePublish}
                disabled={!canPublish}
                className={`w-full font-bold h-12 text-lg transition-all mt-4 ${!canPublish ? 'bg-muted text-muted-foreground' : 'bg-neon-cyan hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.4)]'}`}
              >
                {isPublishing ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                ) : (
                  "Publish Content"
                )}
              </Button>

              {/* Results Area */}
              {results && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="font-semibold text-sm mb-2">Publishing Status</h4>
                  {results.map((res, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-black/40 border border-border/50 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium flex items-center gap-2">
                          {res.platform}
                        </span>
                        {res.status === 'success' ? (
                          <span className="text-green-400 flex items-center gap-1 font-medium"><CheckCircle2 className="w-4 h-4" /> Success</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1 font-medium"><XCircle className="w-4 h-4" /> Failed</span>
                        )}
                      </div>
                      {res.status === 'failure' && res.error && (
                        <div className="text-xs text-red-400 mt-1 bg-red-400/10 p-2 rounded border border-red-500/20">
                          {res.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
