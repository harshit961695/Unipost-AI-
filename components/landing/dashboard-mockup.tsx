"use client"

import { motion } from "framer-motion"
import { Calendar, BarChart3, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardMockup() {
  const [isVisible, setIsVisible] = useState(false)
  
  const posts = [
    { time: "9:00 AM", platform: "Instagram", status: "scheduled" },
    { time: "12:00 PM", platform: "YouTube", status: "scheduled" },
    { time: "3:00 PM", platform: "Instagram", status: "scheduled" },
  ]

  const chartData = [
    { value: 45, label: "Mon" },
    { value: 62, label: "Tue" },
    { value: 38, label: "Wed" },
    { value: 75, label: "Thu" },
    { value: 88, label: "Fri" },
    { value: 92, label: "Sat" },
    { value: 68, label: "Sun" },
  ]

  const maxValue = Math.max(...chartData.map(d => d.value))

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative w-full max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Content Calendar</h3>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2.5 mb-6">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1
              const hasPost = day === 5 || day === 8 || day === 12 || day === 15 || day === 18 || day === 22 || day === 25
              const isToday = day === 15
              return (
                <motion.div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                    isToday
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300/50"
                      : hasPost
                      ? "bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-md"
                      : "bg-gray-100/60 text-gray-600 hover:bg-gray-200/60"
                  }`}
                  whileHover={{ scale: 1.08, zIndex: 10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {day}
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200/50">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Scheduled Posts</h4>
            {posts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-gray-200/50 hover:shadow-md transition-shadow"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{post.time}</p>
                  <p className="text-xs text-gray-500">{post.platform}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {post.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance & Growth</h3>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">+18.5%</span>
              </div>
            </div>
            
            <div className="flex items-end justify-between h-[240px] gap-2 relative">
              {chartData.map((data, index) => {
                const height = (data.value / maxValue) * 100
                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={isVisible ? { height: `${height}%` } : { height: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div className="relative w-full flex items-end justify-center h-full">
                      <motion.div
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 via-cyan-400 to-blue-300 min-h-[20px] shadow-md group-hover:shadow-lg transition-all"
                        style={{ height: `${height}%` }}
                        whileHover={{ scaleY: 1.05 }}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="absolute -top-6 text-xs font-semibold text-gray-700 bg-white/90 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {data.value}K
                      </motion.div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{data.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 p-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Impressions</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">2.5M</p>
              <p className="text-xs text-green-600 mt-1 font-medium">+24%</p>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 p-4"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span className="text-xs font-semibold text-gray-700">Engagement</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">128K</p>
              <p className="text-xs text-green-600 mt-1 font-medium">+18%</p>
            </motion.div>

            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-gray-200/50 p-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-gray-700">Growth</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">156%</p>
              <p className="text-xs text-green-600 mt-1 font-medium">+12%</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
