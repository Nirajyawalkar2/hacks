import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 hover:border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
        secondary:
          "border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800",
        destructive:
          "border-rose-500/50 bg-gradient-to-r from-rose-500/20 via-rose-950/40 to-rose-500/10 text-rose-300 hover:border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]",
        warning:
          "border-amber-500/50 bg-gradient-to-r from-amber-500/20 via-amber-950/40 to-amber-500/10 text-amber-300 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        success:
          "border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 via-emerald-950/40 to-emerald-500/10 text-emerald-300 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        outline: "border-slate-800 text-slate-300 bg-slate-950/80 hover:border-slate-700",
        cyber:
          "border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
        purple:
          "border-purple-500/40 bg-purple-950/40 text-purple-300 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showPulse?: boolean
}

function Badge({ className, variant, showPulse = true, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showPulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      <span>{children}</span>
    </div>
  )
}

export { Badge, badgeVariants }
