import * as React from "react";
import { cn } from "@/lib/utils";

const buttonStyles = {
  variant: {
    default:
      "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/50 hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] active:scale-[0.98] transition-all cursor-pointer",
    glow:
      "bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-black shadow-[0_0_30px_rgba(6,182,212,0.55)] border border-cyan-300/70 hover:shadow-[0_0_35px_rgba(6,182,212,0.75)] active:scale-[0.98] transition-all cursor-pointer",
    destructive:
      "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 font-mono shadow-[0_0_16px_rgba(244,63,94,0.3)] active:scale-[0.98] transition-all backdrop-blur-md cursor-pointer",
    outline:
      "bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-400 font-mono border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] active:scale-[0.98] transition-all backdrop-blur-md cursor-pointer",
    secondary:
      "bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 font-mono border border-slate-800 hover:border-slate-700 active:scale-[0.98] transition-all backdrop-blur-md cursor-pointer",
    ghost:
      "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 font-mono transition-all cursor-pointer",
    link:
      "text-cyan-400 underline-offset-4 hover:underline font-mono cursor-pointer",
    unstyled: "",
  },
  size: {
    default: "h-11 px-5 py-2.5 rounded-xl text-xs",
    sm: "h-9 px-3.5 rounded-lg text-[11px]",
    lg: "h-12 px-7 rounded-xl text-sm",
    icon: "h-11 w-11 rounded-xl",
    unstyled: "",
  }
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles.variant;
  size?: keyof typeof buttonStyles.size;
  asChild?: boolean;
}

export function buttonVariants(options: {
  variant?: keyof typeof buttonStyles.variant;
  size?: keyof typeof buttonStyles.size;
  className?: string;
} = {}): string {
  const { variant = "default", size = "default", className } = options;

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    buttonStyles.variant[variant] || buttonStyles.variant.default,
    buttonStyles.size[size] || buttonStyles.size.default,
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
