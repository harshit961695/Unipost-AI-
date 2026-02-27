"use client"

import { motion } from "framer-motion"
import { TrendingUp, Activity, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export function LiveActivity() {
  const [currentGrowth, setCurrentGrowth] = useState(12.4)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setCurrentGrowth((prev) => {
        const change = (Math.random() - 0.5) * 0.5
        return Math.max(10, Math.min(15, prev + change))
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const activities = [
    { platform: "Instagram", action: "New post published", time: "2m ago" },
    { platform: "YouTube", action: "Video uploaded", time: "5m ago" },
    { platform: "Instagram", action: "Story posted", time: "8m ago" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-strong rounded-xl p-4 md:p-5 border border-white/20 w-full max-w-sm mx-auto lg:mx-0"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-5 h-5 text-neon-cyan" />
            {isLive && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-neon-green/10 border border-neon-green/20">
          <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
          <span className="text-xs font-medium text-neon-green">Live</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className="w-2 h-2 rounded-full bg-neon-cyan flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">
                <span className="font-medium">{activity.platform}</span>{" "}
                {activity.action}
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-yellow" />
            <span className="text-xs text-muted-foreground">Today&apos;s Growth</span>
          </div>
          <motion.span
            key={currentGrowth.toFixed(1)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-lg font-bold text-neon-yellow"
          >
            +{currentGrowth.toFixed(1)}%
          </motion.span>
        </div>
      </div>
    </motion.div>
  )
}
