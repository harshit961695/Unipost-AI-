"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ChartDataPoint {
  value: number
  label: string 
}

export function AnalyticsChart() {
  const [isVisible, setIsVisible] = useState(false)
  
  const data: ChartDataPoint[] = [
    { value: 45, label: "Mon" },
    { value: 62, label: "Tue" },
    { value: 38, label: "Wed" },
    { value: 75, label: "Thu" },
    { value: 88, label: "Fri" },
    { value: 92, label: "Sat" },
    { value: 68, label: "Sun" },
  ]

  const maxValue = Math.max(...data.map(d => d.value))

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="w-full min-h-[400px] md:min-h-[480px] p-6 md:p-8 glass-strong rounded-xl border border-white/20 relative overflow-visible shadow-2xl" style={{ overflow: "visible" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm md:text-base font-medium text-muted-foreground">Engagement Rate</h3>
          <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">8.4%</p>
        </div>
        <div className="text-right">
          <p className="text-xs md:text-sm text-muted-foreground">Last 7 days</p>
          <p className="text-sm md:text-base font-semibold text-neon-green flex items-center gap-1 mt-1">
            <span>↑</span> 12.5%
          </p>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-[260px] md:h-[300px] gap-2 md:gap-3 relative z-10" style={{ overflow: "visible" }}>
        {data.map((point, index) => {
          const height = (point.value / maxValue) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-full flex items-end relative">
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{
                    background: "linear-gradient(to top, #00f0ff, #ffd700)",
                  }}
                  initial={{ height: 0 }}
                  animate={isVisible ? { height: `${height}%` } : { height: 0 }}
                  transition={{
                    duration: 1,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.1,
                    }}
                  />
                </motion.div>
              </div>
              <span className="text-xs text-muted-foreground">{point.label}</span>
            </div>
          )
        })}
      </div>
      
      {/* Line chart overlay */}
      <svg 
        className="absolute bottom-8 left-8 right-8 pointer-events-none opacity-30" 
        style={{ height: "250px", top: "100px" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.polyline
          points={data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - (point.value / maxValue) * 100
            return `${x},${y}`
          }).join(" ")}
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
    </div>
  )
}
