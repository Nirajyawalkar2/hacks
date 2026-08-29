import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/lightswind/border-beam"

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  enableBorderBeam?: boolean
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      className,
      children,
      enableBorderBeam = true,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref as any}
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        className={cn(
          "group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl font-mono font-black text-slate-950 transition-all duration-300 select-none",
          "bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.65)]",
          "border border-cyan-200/60 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...(props as any)}
      >
        {/* Shimmer Continuous Light Sweep */}
        <div
          className="absolute -inset-full z-10 animate-[shimmer_2.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
        />

        {/* Magic UI Animated Gradient Border Beam on Hover */}
        {enableBorderBeam && (
          <BorderBeam
            size={100}
            duration={2.5}
            colorFrom="#ffffff"
            colorTo="#06b6d4"
            borderThickness={2}
            className="z-20 pointer-events-none opacity-80"
          />
        )}

        {/* Content */}
        <div className="relative z-30 flex items-center justify-center gap-2">
          {children}
        </div>
      </motion.button>
    )
  }
)
ShimmerButton.displayName = "ShimmerButton"
