"use client"

import { motion } from "framer-motion"
import { Instagram, Youtube } from "lucide-react"
import { useEffect, useState } from "react"

interface FloatingOutlineIconProps {
  icon: React.ReactNode
  initialX: number
  initialY: number
  delay: number
  mouseX: number
  mouseY: number
  size: number
  color: string
}

function FloatingOutlineIcon({ 
  icon, 
  initialX, 
  initialY, 
  delay, 
  mouseX, 
  mouseY,
  size,
  color
}: FloatingOutlineIconProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY })

  useEffect(() => {
    const parallaxX = (mouseX - window.innerWidth / 2) * 0.008
    const parallaxY = (mouseY - window.innerHeight / 2) * 0.008
    
    setPosition({
      x: initialX + parallaxX,
      y: initialY + parallaxY,
    })
  }, [mouseX, mouseY, initialX, initialY])

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.4, 0.7, 0.4],
        scale: [1, 1.15, 1],
        rotate: [0, 8, -8, 0],
        x: [0, 15, -15, 0],
        y: [0, -20, 20, 0],
      }}
      transition={{
        opacity: {
          duration: 5,
          repeat: Infinity,
          delay,
        },
        scale: {
          duration: 6,
          repeat: Infinity,
          delay,
        },
        rotate: {
          duration: 15,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
        },
        x: {
          duration: 12,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
        },
        y: {
          duration: 14,
          repeat: Infinity,
          delay,
          ease: "easeInOut",
        },
      }}
    >
      <div 
        className={color}
        style={{ width: size, height: size }}
      >
        {icon}
      </div>
    </motion.div>
  )
}

export function FloatingOutlineIcons({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
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
      icon: <Instagram className="w-full h-full" strokeWidth={2} />,
      xPercent: 5,
      yPercent: 12,
      delay: 0,
      size: 140,
      color: "text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]",
    },
    {
      icon: <Youtube className="w-full h-full" strokeWidth={2} />,
      xPercent: 90,
      yPercent: 10,
      delay: 2,
      size: 160,
      color: "text-neon-yellow drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]",
    },
    {
      icon: <Instagram className="w-full h-full" strokeWidth={2} />,
      xPercent: 8,
      yPercent: 60,
      delay: 4,
      size: 120,
      color: "text-neon-purple drop-shadow-[0_0_15px_rgba(176,38,255,0.6)]",
    },
    {
      icon: <Youtube className="w-full h-full" strokeWidth={2} />,
      xPercent: 88,
      yPercent: 65,
      delay: 3,
      size: 130,
      color: "text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]",
    },
  ]

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none">
      {icons.map((item, index) => {
        const x = (item.xPercent / 100) * dimensions.width
        const y = (item.yPercent / 100) * dimensions.height
        return (
          <FloatingOutlineIcon
            key={index}
            icon={item.icon}
            initialX={x}
            initialY={y}
            delay={item.delay}
            mouseX={mouseX}
            mouseY={mouseY}
            size={item.size}
            color={item.color}
          />
        )
      })}
    </div>
  )
}
