import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current progress value */
  value?: number;
  /** Maximum progress value */
  max?: number;
  /** Optional class name for the indicator element */
  indicatorClassName?: string;
  /** Whether to show indeterminate loading animation */
  indeterminate?: boolean;
  /** Color variant for the progress bar adapted to cyber threat theme */
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "purple";
  /** Size variant of the progress bar */
  size?: "sm" | "md" | "lg";
  /** Whether to show the progress value as text */
  showValue?: boolean;
  /** Animation speed for the progress transitions */
  animationSpeed?: "slow" | "normal" | "fast";
  /** Custom gradient or color class override */
  customColor?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    indicatorClassName,
    indeterminate = false,
    color = "default",
    size = "md",
    showValue = false,
    animationSpeed = "normal",
    customColor,
    ...props 
  }, ref) => {
    const percentage = value ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
    const [prevPercentage, setPrevPercentage] = React.useState(percentage);
    const [isAnimating, setIsAnimating] = React.useState(false);
    
    React.useEffect(() => {
      if (percentage !== prevPercentage) {
        setIsAnimating(true);
        setPrevPercentage(percentage);
        
        const timeout = setTimeout(() => {
          setIsAnimating(false);
        }, 800);
        
        return () => clearTimeout(timeout);
      }
    }, [percentage, prevPercentage]);
    
    // Adapted Lightswind cyber threat colors
    const colorVariants: Record<string, string> = {
      default: "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]",
      primary: "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_0_14px_rgba(6,182,212,0.45)]",
      secondary: "bg-gradient-to-r from-slate-700 to-slate-500",
      success: "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_14px_rgba(16,185,129,0.4)]",
      warning: "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_14px_rgba(245,158,11,0.4)]",
      danger: "bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 shadow-[0_0_16px_rgba(244,63,94,0.5)]",
      purple: "bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-[0_0_14px_rgba(168,85,247,0.4)]",
    };
    
    const sizeVariants = {
      sm: "h-2",
      md: "h-3",
      lg: "h-5"
    };
    
    const animationSpeedMs = {
      slow: 1000,
      normal: 700,
      fast: 300
    };
    
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={indeterminate ? undefined : `${Math.round(percentage)}%`}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-slate-950/90 border border-slate-800 shadow-inner",
          sizeVariants[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative h-full w-full flex-1 rounded-full",
            customColor || colorVariants[color] || colorVariants.default,
            indeterminate ? "animate-progress-indeterminate origin-left" : "",
            indicatorClassName
          )}
          style={{
            ...(indeterminate ? {} : { transform: `translateX(-${100 - percentage}%)` }),
            transition: indeterminate
              ? "background-color 200ms, border-color 200ms, box-shadow 200ms"
              : isAnimating
              ? `transform ${animationSpeedMs[animationSpeed]}ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms, border-color 200ms, box-shadow 200ms`
              : "background-color 200ms, border-color 200ms, box-shadow 200ms"
          }}
        >
          {/* Glowing leading-edge beam dot */}
          <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full bg-white shadow-[0_0_10px_#ffffff] opacity-80" />
        </div>

        {showValue && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-semibold font-mono text-white drop-shadow-sm",
            isAnimating ? "transition-opacity duration-300" : ""
          )}>
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
