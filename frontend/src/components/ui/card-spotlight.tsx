import React, { useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  tiltMaxAngle?: number
  enableTilt?: boolean
}

export const CardSpotlight: React.FC<CardSpotlightProps> = ({
  children,
  className,
  spotlightColor = "rgba(6, 182, 212, 0.18)",
  tiltMaxAngle = 7,
  enableTilt = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position within the card for spotlight
  const mouseX = useMotionValue(-500)
  const mouseY = useMotionValue(-500)

  // 3D tilt motion values
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring physics for tilt
  const springConfig = { damping: 20, stiffness: 200 }
  const rotateXSpring = useSpring(useTransform(y, [-0.5, 0.5], [tiltMaxAngle, -tiltMaxAngle]), springConfig)
  const rotateYSpring = useSpring(useTransform(x, [-0.5, 0.5], [-tiltMaxAngle, tiltMaxAngle]), springConfig)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    // Calculate relative coordinates (0 to 1 normalized, centered at 0)
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    mouseX.set(clientX)
    mouseY.set(clientY)

    if (enableTilt) {
      const normalizedX = (clientX / rect.width) - 0.5
      const normalizedY = (clientY / rect.height) - 0.5
      x.set(normalizedX)
      y.set(normalizedY)
    }
  }, [enableTilt, mouseX, mouseY, x, y])

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(-500)
    mouseY.set(-500)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        enableTilt
          ? {
              rotateX: rotateXSpring,
              rotateY: rotateYSpring,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      className={cn(
        "relative rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl transition-shadow duration-300 overflow-hidden",
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
        className
      )}
      {...(props as any)}
    >
      {/* Interactive Cursor Spotlight Glow (Aceternity Pattern) */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 rounded-[inherit] z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mouseX.get()}px ${mouseY.get()}px, ${spotlightColor}, transparent 75%)`,
        }}
      />

      {/* Top Glass Sheen Reflection */}
      <div 
        className="pointer-events-none absolute top-0 left-0 right-0 h-1/3 rounded-t-[inherit] opacity-40 z-0"
        style={{
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)",
        }}
      />

      {/* Inner Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  )
}
