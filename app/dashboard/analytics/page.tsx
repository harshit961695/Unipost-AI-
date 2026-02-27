"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, Users, Eye, Heart, MessageCircle, Share2, ArrowUpRight, Plus, Activity, Link as LinkIcon, BarChart3, AlertCircle, Loader2
} from "lucide-react"
import Link from "next/link"
import useSWR from "swr"
import { motion, useSpring, useTransform } from "framer-motion"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'

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

// Colors for charts
const COLORS = ['#00f0ff', '#8b5cf6', '#ec4899', '#ffaa00'];
// Per-platform mapping breaks in aggregate mode unless tracking individually.
// The new schema flattens this, so we redefine metric colors instead of platforms.
const METRIC_COLORS: Record<string, string> = {
  views: '#1877F2',
  likes: '#E1306C',
  comments: '#FFaa00'
};

export default function AnalyticsPage() {
  // SWR automatically refetches every 30 seconds to fetch latest DB snapshot
  const { data, error, isLoading } = useSWR('/api/analytics/latest', fetcher, { refreshInterval: 30000 })

  // Background poller to actually TRIGGER the fetch-analytics api every 60s
  // This simulates a cron job
  useEffect(() => {
    const triggerFetch = async () => {
      try { await fetch('/api/fetch-analytics'); } catch (e) { }
    }
    triggerFetch() // run once immediately
    const interval = setInterval(triggerFetch, 60000)
    return () => clearInterval(interval)
  }, [])

  // Format the last updated time safely
  const [lastUpdate, setLastUpdate] = useState("Waiting for data...")
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
          <p className="text-muted-foreground">Please check your connection and try again. Retrying automatically in 30s...</p>
        </div>
      </div>
    )
  }

  // --- DESTRUCTURE METRICS ---
  const snapshotData = data?.latest
  const historyData = data?.history || []
  const hasAccounts = data?.hasAccounts

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
            You haven&apos;t linked any social profiles. Connect Meta, YouTube, or Twitter to unlock the live analytics engine.
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

  if (hasAccounts === true && !snapshotData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
        <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent mb-2">Fetching First Data</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your accounts are connected! We are gathering the initial historical analytics. This normally takes about 30 seconds...
          </p>
        </div>
      </div>
    )
  }

  // --- FLAT METRIC ASSIGNMENTS ---
  const totalReach = snapshotData?.total_reach || 0;
  const totalImpressions = snapshotData?.total_impressions || 0;
  const totalEngagement = snapshotData?.total_engagement || 0;
  const totalViews = snapshotData?.total_views || 0;
  const totalLikes = snapshotData?.total_likes || 0;
  const totalComments = snapshotData?.total_comments || 0;

  const engagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

  // --- MAIN LIVE DASHBOARD ---
  const dynamicStats = [
    { name: "Total Reach", value: totalReach, isK: true, icon: Users, color: "text-neon-cyan" },
    { name: "Total Impressions", value: totalImpressions, isK: true, icon: Eye, color: "text-neon-purple" },
    { name: "Total Engagement", value: totalEngagement, isK: true, icon: Activity, color: "text-neon-pink" },
    { name: "Avg ER", value: engagementRate, isPercent: true, icon: Heart, color: "text-neon-green" },
  ]

  // Prepare chart data using flat values
  const timeSeriesData = historyData.map((h: any) => ({
    time: format(new Date(h.snapshot_date || h.created_at || Date.now()), 'HH:mm'),
    reach: h.total_reach || 0,
    impressions: h.total_impressions || 0,
  }));

  const metricBarData = [
    { name: 'Views', value: totalViews, fill: METRIC_COLORS.views },
    { name: 'Likes', value: totalLikes, fill: METRIC_COLORS.likes },
    { name: 'Comments', value: totalComments, fill: METRIC_COLORS.comments }
  ];

  const donutData = [
    { name: 'Likes', value: totalLikes, fill: METRIC_COLORS.likes },
    { name: 'Comments', value: totalComments, fill: METRIC_COLORS.comments }
  ].filter(d => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Real-Time Analytics
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
            Snapshot auto-refreshing every 30s. Last updated: {lastUpdate}
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reach Over Time Area Chart */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Reach Overview</CardTitle>
            <CardDescription>Aggregated reach timeline</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Gathering data...</div>
            )}
          </CardContent>
        </Card>

        {/* Impressions Over Time Line Chart */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Impressions Velocity</CardTitle>
            <CardDescription>Aggregated impressions timeline</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Gathering data...</div>
            )}
          </CardContent>
        </Card>

        {/* Global Metric Comparison Bar Chart */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Global Post Metric Profile</CardTitle>
            <CardDescription>Performance attributes overview</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {metricBarData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricBarData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barSize={30}>
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {metricBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No metric data.</div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Donut Chart */}
        <Card className="glass border-white/10">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Engagement Composition</CardTitle>
                <CardDescription>Ratio of likes to comments</CardDescription>
              </div>
              <Heart className="w-5 h-5 text-neon-pink" />
            </div>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value, name, props) => [`${value} Interactions`, name]}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground">No engagement data available.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
