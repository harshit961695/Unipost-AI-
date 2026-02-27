"use client"

import { motion } from "framer-motion"
import { Instagram, Youtube } from "lucide-react"
import { useEffect, useState } from "react"

interface FloatingIconProps {
  icon: React.ReactNode
  initialX: number
  initialY: number
  delay: number
  mouseX: number
  mouseY: number
}

function FloatingIcon({ icon, initialX, initialY, delay, mouseX, mouseY }: FloatingIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })

  useEffect(() => {
    const parallaxX = (mouseX - window.innerWidth / 2) * 0.01
    const parallaxY = (mouseY - window.innerHeight / 2) * 0.01
    
    setPosition({
      x: initialX + parallaxX,
      y: initialY + parallaxY,
    })
  }, [mouseX, mouseY, initialX, initialY])

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.1, 1],
        x: position.x,
        y: position.y,
      }}
      transition={{
        opacity: {
          duration: 3,
          repeat: Infinity,
          delay,
        },
        scale: {
          duration: 4,
          repeat: Infinity,
          delay,
        },
        x: {
          type: "spring",
          stiffness: 50,
          damping: 20,
        },
        y: {
          type: "spring",
          stiffness: 50,
          damping: 20,
        },
      }}
    >
      {icon}
    </motion.div>
  )
}

export function FloatingIcons({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
      
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
      }
      
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  const icons = [
    {
      icon: <Instagram className="w-16 h-16 text-neon-pink/40" />,
      xPercent: 10,
      yPercent: 20,
      delay: 0,
    },
    {
      icon: <Youtube className="w-20 h-20 text-neon-cyan/40" />,
      xPercent: 85,
      yPercent: 15,
      delay: 1,
    },
    {
      icon: <Instagram className="w-14 h-14 text-neon-purple/30" />,
      xPercent: 15,
      yPercent: 70,
      delay: 2,
    },
    {
      icon: <Youtube className="w-18 h-18 text-neon-pink/30" />,
      xPercent: 80,
      yPercent: 75,
      delay: 1.5,
    },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => {
        const x = (item.xPercent / 100) * dimensions.width
        const y = (item.yPercent / 100) * dimensions.height
        return (
          <FloatingIcon
            key={index}
            icon={item.icon}
            initialX={x}
            initialY={y}
            delay={item.delay}
            mouseX={mouseX}
            mouseY={mouseY}
          />
        )
      })}
    </div>
  )
}
