"use client"

import { motion } from "framer-motion"

export function BackgroundCharts() {
  const chart1 = Array.from({ length: 12 }, (_, i) => ({
    x: (i / 11) * 100,
    y: 30 + Math.sin(i * 0.5) * 20 + Math.random() * 10,
  }))

  const chart2 = Array.from({ length: 10 }, (_, i) => ({
    x: (i / 9) * 100,
    y: 50 + Math.cos(i * 0.7) * 15 + Math.random() * 8,
  }))

  const chart3 = Array.from({ length: 14 }, (_, i) => ({
    x: (i / 13) * 100,
    y: 70 + Math.sin(i * 0.4) * 25 + Math.random() * 12,
  }))

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none opacity-[0.15]">
      {/* Chart 1 */}
      <motion.svg
        className="absolute top-32 left-16 w-80 h-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}  
        transition={{ duration: 6, repeat: Infinity }}
      >
        <motion.polyline
          points={chart1.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#00f0ff"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        {chart1.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="#00f0ff"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.svg>

      {/* Chart 2 */}
      <motion.svg
        className="absolute top-52 right-24 w-96 h-48"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      >
        <motion.polyline
          points={chart2.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#ffd700"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.svg>

      {/* Chart 3 */}
      <motion.svg
        className="absolute bottom-40 left-1/4 w-[500px] h-56"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
      >
        <motion.polyline
          points={chart3.map(p => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#b026ff"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
        />
      </motion.svg>

      {/* Bar chart pattern */}
      <div className="absolute top-1/3 right-1/4 w-64 h-32 opacity-[0.12]">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 bg-gradient-to-t from-neon-cyan to-neon-yellow rounded-t"
            style={{
              left: `${i * 10}%`,
              width: "8%",
              height: `${30 + Math.random() * 50}%`,
            }}
            animate={{
              height: [`${30 + Math.random() * 50}%`, `${40 + Math.random() * 60}%`, `${30 + Math.random() * 50}%`],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  )
}
