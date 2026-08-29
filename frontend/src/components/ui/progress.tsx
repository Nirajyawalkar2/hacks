import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  indicatorColor?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorColor = "bg-gradient-to-r from-cyan-500 to-blue-500", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-3 w-full overflow-hidden rounded-full bg-slate-950/90 border border-slate-800 shadow-inner",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative h-full w-full flex-1 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(6,182,212,0.4)]",
            indicatorColor
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        >
          {/* Glowing leading edge light beam */}
          <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white shadow-[0_0_10px_#ffffff] opacity-80" />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
