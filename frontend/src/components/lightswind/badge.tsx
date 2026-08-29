import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]",
        secondary:
          "border-slate-800 bg-slate-900/80 text-slate-300 shadow-sm",
        destructive:
          "border-rose-500/50 bg-gradient-to-r from-rose-500/25 via-rose-950/50 to-rose-500/10 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.3)] hover:border-rose-400",
        outline:
          "border-slate-800 text-slate-300 bg-slate-950/80 shadow-sm",
        success:
          "border-emerald-500/50 bg-gradient-to-r from-emerald-500/25 via-emerald-950/50 to-emerald-500/10 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:border-emerald-400",
        warning:
          "border-amber-500/50 bg-gradient-to-r from-amber-500/25 via-amber-950/50 to-amber-500/10 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:border-amber-400",
        info:
          "border-cyan-500/50 bg-gradient-to-r from-cyan-500/25 via-cyan-950/50 to-cyan-500/10 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:border-cyan-400",
        purple:
          "border-purple-500/50 bg-gradient-to-r from-purple-500/25 via-purple-950/50 to-purple-500/10 text-purple-300 shadow-[0_0_16px_rgba(168,85,247,0.3)] hover:border-purple-400",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[11px]",
        lg: "px-4 py-1.5 text-sm",
      },
      shape: {
        default: "rounded-xl",
        square: "rounded-sm",
        rounded: "rounded-md",
        pill: "rounded-full",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
  dotColor?: string;
  interactive?: boolean;
  highlighted?: boolean;
}

function Badge({ 
  className, 
  variant, 
  size,
  shape,
  withDot = true,
  dotColor,
  interactive,
  highlighted,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size, shape }), 
        interactive && "cursor-pointer hover:scale-105 active:scale-95",
        highlighted && "ring-2 ring-offset-2 ring-cyan-400",
        className
      )} 
      {...props}
    >
      {withDot && (
        <span className="relative flex h-2 w-2 mr-1">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: dotColor || "currentColor" }}
          />
          <span 
            className="relative inline-flex rounded-full h-2 w-2"
            style={{ backgroundColor: dotColor || "currentColor" }}
          />
        </span>
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
