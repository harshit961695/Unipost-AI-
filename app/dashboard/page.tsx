"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, Users, Eye, Heart, MessageCircle, Share2, ArrowUpRight, Plus, Activity, Link as LinkIcon, BarChart3, AlertCircle
} from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { motion, useSpring, useTransform } from "framer-motion"

// --- Helper Functions ---
const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Failed to fetch')
  return data
}

// --- Animated Number Component ---
function AnimatedNumber({ value, isPercent = false, isK = false }: { value: number, isPercent?: boolean, isK?: boolean }) {
  const spring = useSpring(0, { bounce: 0, duration: 1500 })
  const display = useTransform(spring, (current) => {
    if (isPercent) return current.toFixed(1) + "%"
    if (isK && current >= 1000) return (current / 1000).toFixed(1) + "K"
    return Math.round(current).toLocaleString()
  })

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{display}</motion.span>
}

// --- Main Page Component ---
export default function DashboardPage() {
  // SWR automatically refetches every 60 seconds to keep analytics "Live" effortlessly
  const { data, error, isLoading } = useSWR('/api/dashboard/stats', fetcher, { refreshInterval: 60000 })

  // Format the last updated time safely
  const [lastUpdate, setLastUpdate] = useState("Just now")
  useEffect(() => {
    if (data?.lastUpdated) {
      setLastUpdate(new Date(data.lastUpdated).toLocaleTimeString())
    }
  }, [data?.lastUpdated])

  // --- SKELETON LOADING STATE ---
  if (isLoading || (!data && !error)) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-12 w-64 bg-white/5 rounded-md glass"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="glass border-white/5"><div className="h-32"></div></Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass h-[400px] border-white/5"></Card>
          <Card className="glass h-[400px] border-white/5"></Card>
        </div>
      </div>
    )
  }

  // --- ERROR STATE ---
  if (error || data?.error) {
    return (
      <div className="p-6 flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Failed to load analytics</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  // --- DESTRUCTURE METRICS ---
  const { hasAccounts, metrics, platformStats, recentPosts } = data || {}

  // --- EMPTY STATES ---
  if (hasAccounts === false) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 bg-neon-cyan/10 rounded-full flex items-center justify-center border border-neon-cyan/20">
          <LinkIcon className="w-10 h-10 text-neon-cyan" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-2">Connect Your Accounts</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You are completely set up, but you haven&apos;t linked any social profiles yet! Connect Meta, YouTube, or Twitter to unlock the live analytics engine.
          </p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="neon" size="lg" className="gap-2 shadow-lg shadow-neon-cyan/20 mt-4">
            <ArrowUpRight className="w-5 h-5" /> Let&apos;s Connect
          </Button>
        </Link>
      </div>
    )
  }

  if (metrics?.totalPosts === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <div className="w-20 h-20 bg-neon-purple/10 rounded-full flex items-center justify-center border border-neon-purple/20">
          <Plus className="w-10 h-10 text-neon-purple" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">Create Your First Post</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your connection is live and listening! Publish your first content to see the powerful analytics dashboard come to life dynamically.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="neon" size="lg" className="gap-2 shadow-neon-purple/20 mt-4">
            Launch Creator <ArrowUpRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    )
  }

  // --- MAIN LIVE DASHBOARD ---
  const dynamicStats = [
    { name: "Total Posts", value: metrics?.totalPosts || 0, icon: TrendingUp, color: "text-neon-cyan" },
    { name: "Total Reach", value: metrics?.totalReach || 0, isK: true, icon: Users, color: "text-neon-purple" },
    { name: "Impressions", value: metrics?.totalImpressions || 0, isK: true, icon: Eye, color: "text-neon-pink" },
    { name: "Avg Engagement", value: metrics?.engagementRate || 0, isPercent: true, icon: Heart, color: "text-neon-green" },
  ]

  const pStatsKeys = Object.keys(platformStats || {});

  return (
    <div className="p-6 space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Live Overview
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neon-green/10 border border-neon-green/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green"></span>
              </span>
              <span className="text-xs font-semibold text-neon-green uppercase tracking-wide">Live</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan opacity-70" />
            Data synced real-time from Supabase. Last updated: {lastUpdate}
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button variant="neon" className="gap-2 shadow-neon-cyan/20 px-6">
            <Plus className="w-4 h-4" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dynamicStats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass hover:glow-cyan transition-all h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground relative z-10">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color} relative z-10`} />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-white tracking-tight leading-none mt-2">
                  <AnimatedNumber value={stat.value} isPercent={stat.isPercent} isK={stat.isK} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Recent Network Activity */}
        <Card className="glass md:col-span-8 overflow-hidden relative border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-neon-cyan" />
              Recent Published Network
            </CardTitle>
            <CardDescription>Database records logged from native integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts?.length > 0 ? recentPosts.map((post: any) => (
              <div
                key={post.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:border-neon-cyan/30 transition-all hover:bg-black/40 gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-white line-clamp-1">{post.content || 'Media Post'}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="text-xs px-2 py-0.5 relative z-10 rounded-full bg-white/5 border border-white/10 text-white/80">
                      {post.platform || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {(post.analytics_cache?.impressions || 0)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium tracking-wide border 
                        ${post.status === "published" ? "bg-neon-green/10 text-neon-green border-neon-green/20" :
                      post.status === "failed" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}`}>
                    {post.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2 opacity-50">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center p-8 border border-dashed rounded-lg border-white/10 text-muted-foreground">
                No specific posts logged in the tracking database yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="glass md:col-span-4 border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle>Platform Spread</CardTitle>
            <CardDescription>Live volumetric breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {pStatsKeys.length > 0 ? pStatsKeys.map((platformName) => {
                const p = platformStats[platformName];
                const proportion = metrics?.totalPosts > 0 ? Math.round((p.posts / metrics.totalPosts) * 100) : 0;

                // Colors logic based on platform name
                const colorMap: any = {
                  instagram: "from-pink-500 to-orange-400",
                  facebook: "from-blue-500 to-blue-700",
                  youtube: "from-red-500 to-red-700",
                  twitter: "from-sky-400 to-blue-500",
                  linkedin: "from-blue-600 to-blue-800"
                }

                const grad = colorMap[platformName.toLowerCase()] || "from-neon-cyan to-neon-purple";

                return (
                  <div key={platformName} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-white opacity-90">{platformName}</span>
                      <span className="text-muted-foreground font-mono">{p.posts} posts</span>
                    </div>
                    {/* Value Bar */}
                    <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${proportion}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${grad}`}
                      />
                    </div>
                    {/* Under-metrics */}
                    <div className="flex justify-between text-xs text-muted-foreground opacity-70">
                      <span>{p.reach.toLocaleString()} reach</span>
                      <span>{(p.impressions > 0 ? (p.engagement / p.impressions * 100) : 0).toFixed(1)}% ER</span>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-sm text-center text-muted-foreground py-4">
                  No platform statistics heavily tracked yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
