"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function DataParticles() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none opacity-40">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-br from-neon-cyan to-neon-yellow"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: "0 0 10px rgba(0, 240, 255, 0.8)",
          }}
          animate={{
            y: [
              `${particle.y}%`,
              `${particle.y - 25}%`,
              `${particle.y - 50}%`,
              `${particle.y - 75}%`,
            ],
            x: [
              `${particle.x}%`,
              `${particle.x + (Math.random() - 0.5) * 15}%`,
              `${particle.x + (Math.random() - 0.5) * 20}%`,
              `${particle.x + (Math.random() - 0.5) * 25}%`,
            ],
            opacity: [0, 0.8, 1, 0],
            scale: [0, 1.2, 1.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Data flow lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.svg
          key={`flow-${i}`}
          className="absolute"
          style={{
            left: `${8 + i * 12}%`,
            top: `${15 + (i % 2) * 45}%`,
            width: "250px",
            height: "120px",
          }}
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <motion.path
            d={`M 0,${25 + Math.sin(i) * 12} Q 50,${15 + Math.cos(i) * 18} 100,${25 + Math.sin(i * 1.5) * 12}`}
            fill="none"
            stroke={i % 2 === 0 ? "#00f0ff" : "#ffd700"}
            strokeWidth="1"
            strokeDasharray="3 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          />
        </motion.svg>
      ))}
    </div>
  )
}
