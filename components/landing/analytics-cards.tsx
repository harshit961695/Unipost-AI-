"use client"

import { motion } from "framer-motion"
import { Eye, Heart, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalyticsCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  delay: number
  color: "cyan" | "yellow"
}

function AnalyticsCard({ icon, label, value, change, delay, color }: AnalyticsCardProps) {
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

  const colorClasses = {
    cyan: {
      bg: "bg-neon-cyan/10",
      border: "border-neon-cyan/20",
      text: "text-neon-cyan",
      iconBg: "bg-neon-cyan/20",
    },
    yellow: {
      bg: "bg-neon-yellow/10",
      border: "border-neon-yellow/20",
      text: "text-neon-yellow",
      iconBg: "bg-neon-yellow/20",
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`glass-strong rounded-xl p-4 md:p-6 space-y-3 md:space-y-4 border ${colors.border} hover:shadow-lg transition-all`}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
        <div className="w-5 h-5 md:w-6 md:h-6">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs md:text-sm text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground">
            {count.toFixed(suffix === "K" ? 1 : suffix === "M" ? 1 : 0)}{suffix}
          </h3>
          <span className={`text-xs md:text-sm ${colors.text} flex items-center gap-1 font-medium`}>
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            {change}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function AnalyticsCards() {
  const stats = [
    {
      icon: <Eye className="w-6 h-6 text-neon-cyan" />,
      label: "Total Views",
      value: "2.5M",
      change: "+24%",
      color: "cyan" as const,
      delay: 0,
    },
    {
      icon: <Heart className="w-6 h-6 text-neon-yellow" />,
      label: "Engagement",
      value: "128K",
      change: "+18%",
      color: "yellow" as const,
      delay: 0.1,
    },
    {
      icon: <Users className="w-6 h-6 text-neon-cyan" />,
      label: "Active Users",
      value: "45.2K",
      change: "+31%",
      color: "cyan" as const,
      delay: 0.2,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <AnalyticsCard key={index} {...stat} />
      ))}
    </div>
  )
}
