"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Eye } from "lucide-react"
import { useEffect, useState } from "react"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  delay: number
  color: string
}

function StatCard({ icon, label, value, change, delay, color }: StatCardProps) {
  const [count, setCount] = useState(0)
  const numericValue = parseFloat(value.replace(/[^\d.]/g, ""))
  const suffix = value.replace(/[\d.]/g, "")
 
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setCount(numericValue)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="glass-strong rounded-2xl p-6 space-y-4 hover:glow-cyan transition-all border border-white/10"
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
        style={{
          background: color === "from-neon-cyan to-neon-blue" 
            ? "linear-gradient(to bottom right, #00f0ff, #0066ff)"
            : color === "from-neon-purple to-neon-pink"
            ? "linear-gradient(to bottom right, #b026ff, #ff00ff)"
            : "linear-gradient(to bottom right, #ff00ff, #b026ff)"
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            {count.toFixed(suffix === "K" ? 1 : 0)}{suffix}
          </h3>
          <span className="text-sm text-neon-green flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {change}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
export function AnimatedStats() {
  const stats = [
    {
      icon: <Eye className="w-7 h-7 text-white" />,
      label: "Total Views",
      value: "2.5M",
      change: "+24%",
      color: "from-neon-cyan to-neon-blue",
      delay: 0,
    },
    {
      icon: <Users className="w-7 h-7 text-white" />,
      label: "Active Users",
      value: "45.2K",
      change: "+18%",
      color: "from-neon-purple to-neon-pink",
      delay: 0.2,
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-white" />,
      label: "Growth Rate",
      value: "156%",
      change: "+12%",
      color: "from-neon-pink to-neon-purple",
      delay: 0.4,
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
