"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, BarChart3, Zap, Globe, Shield, TrendingUp } from "lucide-react"
import { AnalyticsChart } from "@/components/landing/analytics-chart"
import { DashboardPreview } from "@/components/landing/dashboard-preview"
import { PostingStatusGrid } from "@/components/landing/posting-status"
import { AnalyticsCards } from "@/components/landing/analytics-cards"
import { DashboardMockup } from "@/components/landing/dashboard-mockup"
import { PlatformIcons } from "@/components/landing/platform-icons"

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="bg-gradient-to-br from-[#1e2538] via-[#1a2232] to-[#16202e]" style={{ background: "linear-gradient(135deg, #1e2538 0%, #1a2232 50%, #16202e 100%)" }}>
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 container mx-auto px-6 py-6 border-b border-white/5"
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Sparkles className="w-7 h-7 text-neon-cyan" />
            <span className="text-xl font-bold text-foreground">UniPost AI</span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="glass">
                  Sign In
                </Button>
              </motion.div>
            </Link>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-yellow text-background font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 30, 0],
              y: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-purple-500/8 rounded-full blur-3xl"
            animate={{
              x: [0, -20, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[600px]">
            {/* Left: Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-300">Analytics-Driven Publishing</span>
                </motion.div>
                
                <h1 className="font-bold max-w-[580px] md:max-w-[650px] lg:max-w-[720px] hero-heading">
                  <div className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.75rem] leading-[1.15] tracking-[-0.015em] text-white">
                    Publish Everywhere
                  </div>
                  <div className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] xl:text-[4.75rem] leading-[1.15] tracking-[-0.015em] bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mt-0.5 lg:mt-1">
                    From One Dashboard
                  </div>
                </h1>
                
                <p className="text-base md:text-lg lg:text-xl text-gray-400 leading-[1.7] max-w-xl font-normal tracking-[0.01em]">
                  AI-powered content creation and multi-platform publishing. 
                  Track performance, schedule posts, and grow your audience with real-time analytics.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg" 
                      className="text-base px-8 py-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg w-full sm:w-auto"
                    >
                      Start Creating
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-base px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-full lg:h-[600px]"
            >
              <div className="relative h-full">
                <DashboardMockup />
                <PlatformIcons mouseX={mousePosition.x} mouseY={mousePosition.y} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="relative z-10 py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Your Content, <span className="bg-gradient-to-r from-neon-cyan to-neon-yellow bg-clip-text text-transparent">Unified</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                See all your social media performance in one powerful dashboard
              </p>
            </div>
            <DashboardPreview />
          </motion.div>
        </div>
      </section>

      {/* Posting Status Section */}
      <section className="relative z-10 py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Multi-Platform <span className="bg-gradient-to-r from-neon-cyan to-neon-yellow bg-clip-text text-transparent">Publishing</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Manage all your social accounts from one place
              </p>
            </div>
            <PostingStatusGrid />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Everything You Need to <span className="bg-gradient-to-r from-neon-cyan to-neon-yellow bg-clip-text text-transparent">Succeed</span>
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Zap className="w-6 h-6 text-neon-cyan" />,
                  title: "AI-Powered Captions",
                  description: "Generate engaging captions optimized for each platform with advanced AI",
                  color: "neon-cyan",
                  delay: 0,
                },
                {
                  icon: <Globe className="w-6 h-6 text-neon-yellow" />,
                  title: "Multi-Platform",
                  description: "Publish to Instagram, Twitter, LinkedIn, Facebook, and more simultaneously",
                  color: "neon-yellow",
                  delay: 0.2,
                },
                {
                  icon: <BarChart3 className="w-6 h-6 text-neon-cyan" />,
                  title: "Real-Time Analytics",
                  description: "Track performance across all platforms with unified analytics and insights",
                  color: "neon-cyan",
                  delay: 0.4,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass-strong rounded-xl p-6 space-y-4 border border-white/10 hover:border-neon-cyan/30 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: feature.color === "neon-cyan" 
                        ? "rgba(0, 240, 255, 0.15)"
                        : "rgba(255, 215, 0, 0.15)"
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8 glass-strong rounded-2xl p-12 border border-white/20"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Grow Your Audience?
              </h2>
              <p className="text-lg text-gray-400">
                Join thousands of creators using UniPost AI to streamline their social media strategy
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="text-base px-8 py-6 gap-2 bg-gradient-to-r from-neon-cyan to-neon-yellow text-background font-semibold hover:opacity-90 transition-opacity"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-base px-8 py-6 glass">
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-t border-white/5 mt-20"
      >
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <span className="text-base font-semibold text-foreground">UniPost AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 UniPost AI. Built for creators.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
