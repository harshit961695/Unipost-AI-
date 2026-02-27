"use client"

import { motion } from "framer-motion"
import { TrendingUp, Eye, Heart, MessageCircle, Share2, Instagram, Youtube } from "lucide-react"

export function DashboardPreview() {
  const stats = [
    { icon: Eye, value: "2.5M", label: "Total Views", change: "+24%", color: "text-neon-cyan" },
    { icon: Heart, value: "128K", label: "Likes", change: "+18%", color: "text-neon-yellow" },
    { icon: MessageCircle, value: "8.4K", label: "Comments", change: "+12%", color: "text-neon-cyan" },
    { icon: Share2, value: "45.2K", label: "Shares", change: "+31%", color: "text-neon-yellow" },
  ]

  const recentPosts = [
    {
      platform: "Instagram",
      icon: Instagram,
      title: "Product Launch Announcement",
      engagement: "12.4K",
      time: "2h ago",
      status: "published",
      color: "from-purple-500 to-pink-500",
    },
    {
      platform: "YouTube",
      icon: Youtube,
      title: "Tutorial: Getting Started",
      engagement: "8.9K",
      time: "5h ago",
      status: "published",
      color: "from-red-500 to-red-600",
    },
    {
      platform: "Instagram",
      icon: Instagram,
      title: "Weekly Roundup",
      engagement: "6.7K",
      time: "1d ago",
      status: "scheduled",
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="w-full glass-strong rounded-2xl p-6 border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Analytics Overview</h3>
          <p className="text-sm text-muted-foreground">Last 30 days performance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
          <TrendingUp className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm font-medium text-neon-cyan">+18.5%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-neon-green font-medium">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Posts */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground mb-3">Recent Posts</h4>
        {recentPosts.map((post, index) => {
          const Icon = post.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 glass rounded-lg border border-white/10 hover:border-neon-cyan/30 transition-all"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${post.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{post.engagement} engagement</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{post.time}</span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  post.status === "published"
                    ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                    : "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
                }`}
              >
                {post.status}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
