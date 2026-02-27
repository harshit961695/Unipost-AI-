"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings as SettingsIcon, User, Bell, Shield, Link as LinkIcon, Loader2, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

type Connection = {
  platform: string
  metadata: any
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('connected_accounts')
        .select('platform, metadata, created_at, page_id, instagram_business_id')
        .eq('user_id', user.id)
        .neq('access_token', '')

      if (error) throw error
      console.log('[SETTINGS] Fetched connections:', data)
      setConnections(data || [])
    } catch (error) {
      console.error('Error fetching connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = (platform: string, connectRoute?: string) => {
    setConnecting(platform)
    const timeoutId = setTimeout(() => {
      // If after 10 seconds the redirect hasn't processed
      // Stop the navigation and reset the UI smoothly
      window.stop();
      setConnecting(null);
      alert(`Connection to ${platform} timed out due to a network issue. Please manually try again.`);
    }, 10000);

    // Provide the timeoutId to be cleared if needed (though navigation normally unloads the page)
    window.location.href = `/api/connect/${connectRoute || platform}`;
  }

  const handleDisconnect = async (platform: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      setLoading(true);
      const res = await fetch(`/api/disconnect/${platform}`, {
        method: 'DELETE',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to disconnect');
      }

      // Fetch fresh data from DB as the single source of truth
      await fetchConnections();

      alert(`Successfully disconnected ${platform}!`);

    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Error disconnecting:', error);

      if (error.name === 'AbortError') {
        alert(`Disconnect operation for ${platform} timed out after 10 seconds. Aborted safely. No automatic retries.`);
      } else {
        alert(error.message || 'Error disconnecting. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const isConnected = (platform: string) => {
    return connections.some(c => c.platform === platform)
  }

  const searchParams = (typeof window !== 'undefined' && mounted) ? new URLSearchParams(window.location.search) : null
  const success = searchParams?.get('success')
  const error = searchParams?.get('error')

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {success && (
        <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-lg text-neon-green animate-in fade-in slide-in-from-top-4">
          {success === 'meta_connected' ? 'Successfully connected to Meta (Facebook & Instagram)!' : 'Connection successful!'}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 animate-in fade-in slide-in-from-top-4">
          {error === 'no_pages_found' ? 'No Facebook pages found. Please ensure you have a Facebook page linked to your Instagram Business account.' : 'Connection failed. Please try again.'}
        </div>
      )}

      <div className="space-y-6">
        {/* Profile Settings - Static for now */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                <User className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input defaultValue="John Doe" className="glass" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" defaultValue="john@example.com" className="glass" />
            </div>
            <Button variant="neon">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-neon-purple" />
              </div>
              <div className="flex-1">
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your social media connections</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => fetchConnections()} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'youtube', name: 'YouTube' },
              { id: 'instagram', name: 'Instagram', connectRoute: 'meta' },
              { id: 'facebook', name: 'Facebook', connectRoute: 'meta' },
              { id: 'twitter', name: 'Twitter' },
              { id: 'linkedin', name: 'LinkedIn' },
            ].map((platform) => {
              const connected = isConnected(platform.id)
              return (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-4 rounded-lg glass border border-border/50"
                >
                  <span className="font-medium">{platform.name}</span>

                  {connected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neon-green bg-neon-green/10 px-2 py-1 rounded border border-neon-green/20">
                        Connected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
                      onClick={() => handleConnect(platform.id, platform.connectRoute)}
                      disabled={loading || (connecting === platform.id)}
                    >
                      {connecting === platform.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Connect
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
