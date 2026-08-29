"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

export type LiquidGlassCardVariant =
  | "glass"
  | "emerald"
  | "primary"
  | "cyan"
  | "purple"
  | "aurora"
  | "dark";

export interface LiquidGlassCardProps
  extends Omit<HTMLMotionProps<"div">, "title"> {
  variant?: LiquidGlassCardVariant;
  glow?: boolean;
  hoverEffect?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/* ─── Adapted Cyber Threat Variant Config ─────────────────────────── */
const VARIANT_CONFIG: Record<
  LiquidGlassCardVariant,
  {
    gradient: string;
    border: string;
    shadow: string;
    glowShadow: string;
  }
> = {
  glass: {
    gradient:
      "bg-gradient-to-b from-slate-900/70 via-slate-950/80 to-[#05070c]/90 text-white",
    border: "border-slate-800/90 hover:border-slate-700",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_0px_rgba(255,255,255,0.15)]",
    glowShadow: "shadow-[0_0_50px_rgba(6,182,212,0.15)]",
  },
  emerald: {
    gradient:
      "bg-gradient-to-b from-emerald-950/70 via-slate-950/80 to-[#05070c]/90 text-white",
    border: "border-emerald-500/40 hover:border-emerald-500/70",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(16,185,129,0.3),inset_0_1px_1px_0px_rgba(16,185,129,0.3)]",
    glowShadow: "shadow-[0_0_60px_rgba(16,185,129,0.35)]",
  },
  primary: {
    gradient:
      "bg-gradient-to-b from-rose-950/80 via-slate-950/85 to-[#05070c]/95 text-white",
    border: "border-rose-500/50 hover:border-rose-500/80",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(244,63,94,0.35),inset_0_1px_1px_0px_rgba(244,63,94,0.4)]",
    glowShadow: "shadow-[0_0_70px_rgba(244,63,94,0.45)]",
  },
  cyan: {
    gradient:
      "bg-gradient-to-b from-cyan-950/80 via-slate-950/85 to-[#05070c]/95 text-white",
    border: "border-cyan-500/50 hover:border-cyan-500/80",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(6,182,212,0.35),inset_0_1px_1px_0px_rgba(6,182,212,0.4)]",
    glowShadow: "shadow-[0_0_70px_rgba(6,182,212,0.4)]",
  },
  purple: {
    gradient:
      "bg-gradient-to-b from-purple-950/80 via-slate-950/85 to-[#05070c]/95 text-white",
    border: "border-purple-500/50 hover:border-purple-500/80",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(168,85,247,0.35),inset_0_1px_1px_0px_rgba(168,85,247,0.4)]",
    glowShadow: "shadow-[0_0_70px_rgba(168,85,247,0.4)]",
  },
  aurora: {
    gradient:
      "bg-gradient-to-b from-violet-950/80 via-slate-950/85 to-[#05070c]/95 text-white",
    border: "border-violet-500/50 hover:border-violet-500/80",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(139,92,246,0.35),inset_0_1px_1px_0px_rgba(139,92,246,0.4)]",
    glowShadow: "shadow-[0_0_70px_rgba(139,92,246,0.4)]",
  },
  dark: {
    gradient:
      "bg-gradient-to-b from-slate-900/85 via-slate-950/90 to-[#05070c] text-white",
    border: "border-slate-800 hover:border-slate-700",
    shadow:
      "shadow-[0_16px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_0px_rgba(255,255,255,0.1)]",
    glowShadow: "shadow-[0_0_60px_rgba(0,0,0,0.9)]",
  },
};

/* ─── Main Card Component ────────────────────────────────────────── */
export const LiquidGlassCard = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardProps
>(
  (
    {
      variant = "glass",
      glow = false,
      hoverEffect = true,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const cfg = VARIANT_CONFIG[variant];

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -3, scale: 1.008 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "relative w-full rounded-2xl overflow-hidden backdrop-blur-2xl border transition-all duration-300",
          cfg.gradient,
          cfg.border,
          cfg.shadow,
          glow && cfg.glowShadow,
          className
        )}
        {...props}
      >
        {/* Top gloss glare reflection */}
        <span
          className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none rounded-t-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Bottom prism refraction */}
        <span
          className="absolute bottom-0 left-0 right-0 h-[15%] pointer-events-none rounded-b-[inherit]"
          style={{
            background:
              "linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)",
          }}
        />

        {/* Card Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </motion.div>
    );
  }
);

LiquidGlassCard.displayName = "LiquidGlassCard";

/* ─── Card Subcomponents ─────────────────────────────────────────── */
export interface LiquidGlassCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardHeader = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardHeaderProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-3 border-b border-slate-800/80", className)}
    {...props}
  />
));
LiquidGlassCardHeader.displayName = "LiquidGlassCardHeader";

export interface LiquidGlassCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const LiquidGlassCardTitle = React.forwardRef<
  HTMLHeadingElement,
  LiquidGlassCardTitleProps
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-base font-bold font-mono text-white leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
LiquidGlassCardTitle.displayName = "LiquidGlassCardTitle";

export interface LiquidGlassCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const LiquidGlassCardDescription = React.forwardRef<
  HTMLParagraphElement,
  LiquidGlassCardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-slate-300 font-sans leading-relaxed", className)}
    {...props}
  />
));
LiquidGlassCardDescription.displayName = "LiquidGlassCardDescription";

export interface LiquidGlassCardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardContent = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardContentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-4", className)} {...props} />
));
LiquidGlassCardContent.displayName = "LiquidGlassCardContent";

export interface LiquidGlassCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const LiquidGlassCardFooter = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardFooterProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 font-mono text-xs", className)}
    {...props}
  />
));
LiquidGlassCardFooter.displayName = "LiquidGlassCardFooter";
