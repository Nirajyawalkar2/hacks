import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps, AnimatePresence } from "framer-motion";
import { BorderBeam } from "./border-beam";

export interface InputProps extends HTMLMotionProps<"input"> {
  beamBorderRadius?: number;
}

function getBeamRadius(className?: string, explicitRadius?: number): number {
  if (explicitRadius !== undefined) return explicitRadius;
  if (!className) return 12;
  if (/\brounded-none\b/.test(className)) return 0;
  if (/\brounded-full\b/.test(className)) return 9999;
  if (/\brounded-3xl\b/.test(className)) return 24;
  if (/\brounded-2xl\b/.test(className)) return 16;
  if (/\brounded-xl\b/.test(className)) return 12;
  if (/\brounded-lg\b/.test(className)) return 8;
  if (/\brounded-md\b/.test(className)) return 6;
  if (/\brounded-sm\b/.test(className)) return 2;
  if (/\brounded\b/.test(className)) return 4;
  return 12;
}

function getRadiusClass(className?: string): string {
  if (!className) return "rounded-xl";
  const match = className.match(/\b(rounded-(?:none|full|3xl|2xl|xl|lg|md|sm)|rounded)\b/);
  return match ? match[0] : "rounded-xl";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, beamBorderRadius, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const classList = className ? className.split(/\s+/) : [];
    const layoutClasses = classList.filter((c) =>
      /^(col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-|shrink-|grow-|self-|order-|justify-self-|align-self-|w-|max-w-)/.test(c)
    );
    const otherClasses = classList.filter((c) =>
      !/^(col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|flex-|shrink-|grow-|self-|order-|justify-self-|align-self-|w-|max-w-)/.test(c)
    );

    const radiusClass = getRadiusClass(className);
    const calculatedBeamRadius = getBeamRadius(className, beamBorderRadius);

    return (
      <div className={cn("relative w-full group/input", radiusClass, layoutClasses.join(" "))}>
        <motion.input
          type={type}
          className={cn(
            `flex h-11 w-full rounded-xl border border-slate-800/90 bg-slate-950/90 
            px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500
            focus-visible:outline-none focus-visible:border-cyan-500/80 focus-visible:ring-1 focus-visible:ring-cyan-500/40
            disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-inner`,
            otherClasses.join(" ")
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          animate={{
            scale: isFocused ? 1.002 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 20,
          }}
          {...props}
        />
        <AnimatePresence>
          {isFocused && (
            <motion.div
              key="beam-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none rounded-[inherit]"
            >
              <BorderBeam
                size={140}
                duration={3}
                beamBorderRadius={calculatedBeamRadius}
                colorFrom="#06b6d4"
                colorTo="#a855f7"
                className="pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };