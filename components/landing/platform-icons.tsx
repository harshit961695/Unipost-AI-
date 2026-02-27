"use client"

import { motion } from "framer-motion"
import { Instagram, Youtube, Twitter, Linkedin } from "lucide-react"
import { useState, useEffect } from "react"

export function PlatformIcons({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const platforms = [
    { x: 15, y: 25, icon: Instagram, color: "from-purple-500 to-pink-500", delay: 0 },
    { x: 80, y: 20, icon: Youtube, color: "from-red-500 to-red-600", delay: 0.5 },
    { x: 20, y: 75, icon: Twitter, color: "from-blue-400 to-blue-600", delay: 1 },
    { x: 75, y: 70, icon: Linkedin, color: "from-blue-600 to-blue-800", delay: 1.5 },
  ]

  const parallaxX = mounted ? (mouseX - window.innerWidth / 2) * 0.005 : 0
  const parallaxY = mounted ? (mouseY - window.innerHeight / 2) * 0.005 : 0

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {platforms.map((platform, index) => {
        const Icon = platform.icon
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              left: `${platform.x}%`,
              top: `${platform.y}%`,
              x: parallaxX * (index + 1),
              y: parallaxY * (index + 1),
            }}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3 + index,
              repeat: Infinity,
              delay: platform.delay,
              ease: "easeInOut",
            }}
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
