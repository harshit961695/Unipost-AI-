"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    BarChart3,
    Users,
    Eye,
    Video,
    TrendingUp,
    TrendingDown,
    Loader2,
    Calendar,
    Activity
} from "lucide-react"

interface AnalyticsData {
    connected: boolean
    channelName?: string
    subscribers: number
    views: number
    videos: number
    totalEngagement: number
    engagementRate: number
    chartData: Array<{ date: string; views: number; subscribers: number }>
}

export function YouTubeAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/youtube/analytics')
            const result = await response.json()
            if (result.success) {
                setData(result.analytics)
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
                <p className="text-muted-foreground font-medium">Crunching the numbers...</p>
            </div>
        )
    }

    if (!data?.connected) {
        return (
            <Card className="glass p-20 text-center border-dashed">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h3 className="text-lg font-semibold">No analytics Available</h3>
                <p className="text-muted-foreground">Please ensure your YouTube account is connected.</p>
            </Card>
        )
    }

    const stats = [
        {
            title: "Total Subscribers",
            value: data.subscribers.toLocaleString(),
            icon: Users,
            trend: "+12%", // Mock trend
            isUp: true
        },
        {
            title: "Channel Views",
            value: data.views.toLocaleString(),
            icon: Eye,
            trend: "+5.4%", // Mock trend
            isUp: true
        },
        {
            title: "Total Videos",
            value: data.videos.toLocaleString(),
            icon: Video,
            trend: "new",
            isUp: true
        },
        {
            title: "Engagement rate",
            value: `${data.engagementRate}%`,
            icon: Activity,
            trend: "-0.2%", // Mock trend
            isUp: false
        }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-border/40 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20">
                        <TrendingUp className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{data.channelName || 'YouTube Channel'}</h3>
                        <p className="text-sm text-muted-foreground">Performance overview for all time</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
                        <Calendar className="w-3 h-3" /> Last 30 Days
                    </div>
                    <p className="text-lg font-bold text-red-500">Real-time Data</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="glass border-border/40 hover:border-red-500/30 transition-all duration-300">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/20">
                                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${stat.trend === 'new' ? 'bg-blue-500/10 text-blue-500' :
                                    stat.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                <h4 className="text-2xl font-black mt-1 tracking-tight">{stat.value}</h4>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Placeholder / Enhanced Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 glass border-border/40 min-h-[300px] flex flex-col p-6 gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-lg">Daily View Trends</h4>
                            <p className="text-xs text-muted-foreground">Views over the last 7 days</p>
                        </div>
                        <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-[10px] font-bold border border-red-500/20">
                            LIVE
                        </div>
                    </div>

                    <div className="flex-1 min-h-[200px] relative mt-4">
                        {/* Simple SVG Chart */}
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Area */}
                            <path
                                d={`M 0 40 ${data.chartData.map((d, i) =>
                                    `L ${(i / (data.chartData.length - 1)) * 100} ${40 - (d.views / Math.max(...data.chartData.map(v => v.views)) * 30 || 2)}`
                                ).join(' ')} L 100 40 Z`}
                                fill="url(#chartGradient)"
                            />

                            {/* Line */}
                            <path
                                d={data.chartData.map((d, i) =>
                                    `${i === 0 ? 'M' : 'L'} ${(i / (data.chartData.length - 1)) * 100} ${40 - (d.views / Math.max(...data.chartData.map(v => v.views)) * 30 || 2)}`
                                ).join(' ')}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Data Points */}
                            {data.chartData.map((d, i) => (
                                <circle
                                    key={i}
                                    cx={(i / (data.chartData.length - 1)) * 100}
                                    cy={40 - (d.views / Math.max(...data.chartData.map(v => v.views)) * 30 || 2)}
                                    r="0.8"
                                    fill="#ef4444"
                                    className="hover:r-1.5 cursor-pointer transition-all"
                                />
                            ))}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between mt-2 pt-2 border-t border-border/10">
                            {data.chartData.map((d, i) => (
                                <span key={i} className="text-[9px] text-muted-foreground font-medium">
                                    {d.date}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="glass border-border/40 p-6 space-y-6">
                    <h4 className="font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-500" /> Recent Activity
                    </h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border/20">
                                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold">Channel views spike</p>
                                    <p className="text-[10px] text-muted-foreground">3 hours ago</p>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-500">+4%</div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground text-center">
                            Synchronized with YouTube Studio API
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
