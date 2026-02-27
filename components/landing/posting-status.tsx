"use client"

import { motion } from "framer-motion"
import { Instagram, Youtube, CheckCircle2, Clock, Send } from "lucide-react"

interface PostingStatusProps {
  platform: "instagram" | "youtube"
  postsToday: number
  scheduled: number
  lastPost: string
  status: "active" | "pending"
}

export function PostingStatusCard({ platform, postsToday, scheduled, lastPost, status }: PostingStatusProps) {
  const config = {
    instagram: {
      icon: Instagram,
      name: "Instagram",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    youtube: {
      icon: Youtube,
      name: "YouTube",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
  }

  const { icon: Icon, name, color, bgColor, borderColor } = config[platform]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`glass-strong rounded-xl p-5 border ${borderColor} hover:shadow-lg transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{name}</h4>
            <div className="flex items-center gap-2 mt-1">
              {status === "active" ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-neon-green" />
                  <span className="text-xs text-neon-green">Connected</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-neon-yellow" />
                  <span className="text-xs text-neon-yellow">Pending</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Posts Today</span>
          <span className="text-lg font-bold text-foreground">{postsToday}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Scheduled</span>
          <span className="text-lg font-bold text-foreground">{scheduled}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-sm text-muted-foreground">Last Post</span>
          <span className="text-sm font-medium text-foreground">{lastPost}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full mt-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${bgColor} border ${borderColor} text-foreground hover:opacity-90 transition-opacity`}
      >
        <Send className="w-4 h-4" />
        Create Post
      </motion.button>
    </motion.div>
  )
}

export function PostingStatusGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <PostingStatusCard
        platform="instagram"
        postsToday={12}
        scheduled={8}
        lastPost="2h ago"
        status="active"
      />
      <PostingStatusCard
        platform="youtube"
        postsToday={3}
        scheduled={5}
        lastPost="5h ago"
        status="active"
      />
    </div>
  )
}
