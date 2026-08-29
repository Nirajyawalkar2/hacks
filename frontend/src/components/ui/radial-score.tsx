import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface RadialScoreProps {
  score: number
  riskLevel: string
  confidence: number
  className?: string
}

export const RadialScore: React.FC<RadialScoreProps> = ({
  score,
  riskLevel,
  confidence,
  className
}) => {
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreStroke = (val: number) => {
    if (val >= 80) return "#ef4444"
    if (val >= 60) return "#f97316"
    if (val >= 40) return "#f59e0b"
    return "#10b981"
  }

  const getGlowBg = (val: number) => {
    if (val >= 80) return "bg-rose-500/25 shadow-[0_0_80px_rgba(244,63,94,0.45)]"
    if (val >= 60) return "bg-orange-500/25 shadow-[0_0_80px_rgba(249,115,22,0.4)]"
    if (val >= 40) return "bg-amber-500/25 shadow-[0_0_80px_rgba(245,158,11,0.35)]"
    return "bg-emerald-500/25 shadow-[0_0_80px_rgba(16,185,129,0.35)]"
  }

  const getBadgeColor = (val: number) => {
    if (val >= 80) return "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.35)] animate-pulse"
    if (val >= 60) return "bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
    if (val >= 40) return "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 text-center font-mono relative", className)}>
      
      {/* Multi-layered 3D Ambient Core Glow Behind Ring */}
      <div className={`absolute h-44 w-44 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${getGlowBg(score)}`} />

      <span className="text-xs text-slate-400 uppercase tracking-widest relative z-10 font-bold">
        Calculated Threat Score
      </span>

      {/* Floating 3D SVG Radial Score Ring */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative my-6 flex items-center justify-center z-10"
      >
        <svg className="h-48 w-48 -rotate-90 transform overflow-visible drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
          <defs>
            <filter id="score-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={getScoreStroke(score)} floodOpacity="0.4" />
            </filter>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="60%" stopColor={getScoreStroke(score)} />
              <stop offset="100%" stopColor={getScoreStroke(score)} />
            </linearGradient>
          </defs>

          {/* 3D Outer Recessed Bevel Track */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-slate-900"
            strokeWidth="14"
            fill="transparent"
          />

          {/* Background Track with Inner Groove */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="11"
            fill="transparent"
          />

          {/* Animated 3D Floating Progress Indicator with Spring Overshoot */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke="url(#score-gradient)"
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{
              type: "spring",
              stiffness: 45,
              damping: 11,
              restDelta: 0.001
            }}
            strokeLinecap="round"
            fill="transparent"
            filter="url(#score-shadow)"
          />
        </svg>

        {/* Score Value Display with Floating Depth */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <motion.span 
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 15 }}
            className="text-5xl sm:text-6xl font-black text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]"
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-slate-400 tracking-wider font-bold mt-1">
            OUT OF 100
          </span>
        </div>
      </motion.div>

      {/* Level Badge & Confidence */}
      <div className="space-y-2 relative z-10">
        <div className={`inline-block rounded-xl px-5 py-1.5 text-xs font-black uppercase tracking-wider border ${getBadgeColor(score)}`}>
          {riskLevel}
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Confidence Rating: <strong className="text-slate-100 font-bold">{confidence}%</strong>
        </div>
      </div>
    </div>
  )
}
