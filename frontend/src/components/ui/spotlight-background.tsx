import React, { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
  color: string
}

export const SpotlightBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([])

  // Mouse parallax motion values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 30, stiffness: 100 }
  const parallaxX = useSpring(mouseX, springConfig)
  const parallaxY = useSpring(mouseY, springConfig)

  useEffect(() => {
    // Generate subtle cyber sparkle particles (Aceternity UI Sparkles pattern)
    const colors = ["#06b6d4", "#38bdf8", "#a855f7", "#ffffff"]
    const items: Particle[] = []
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 8 + 6,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.45 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setParticles(items)

    const handleMouseMove = (e: MouseEvent) => {
      // Subtle parallax offset (-20px to +20px)
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 40
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 40
      mouseX.set(xNorm)
      mouseY.set(yNorm)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Cyber Dot Grid Layer with Parallax Shift */}
      <motion.div 
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute -inset-10 cyber-dot-grid opacity-35" 
      />

      {/* 2. Top Cyan Spotlight Glow */}
      <div className="absolute -top-48 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-cyan-500/12 blur-[150px]" />

      {/* 3. Right Purple Ambient Glow Blob */}
      <div className="absolute top-1/4 -right-40 h-[500px] w-[600px] rounded-full bg-purple-600/12 blur-[140px]" />

      {/* 4. Left Crimson Ambient Glow Blob */}
      <div className="absolute bottom-10 -left-40 h-[450px] w-[550px] rounded-full bg-rose-600/10 blur-[150px]" />

      {/* 5. Floating Parallax Cyber Sparkles (Aceternity Sparkles) */}
      <motion.div style={{ x: parallaxX, y: parallaxY }} className="absolute inset-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{
              y: ["0vh", "-8vh", "0vh"],
              opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: "50%",
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
