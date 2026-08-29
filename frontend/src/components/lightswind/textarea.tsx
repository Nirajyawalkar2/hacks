import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <textarea
        className={cn(
          `flex min-h-[120px] w-full rounded-xl bg-slate-950/90 border border-slate-800/90
           p-4 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-500
           focus-visible:outline-none focus-visible:border-cyan-500/80 
           focus-visible:ring-1 focus-visible:ring-cyan-500/40 
           disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-inner`,
          isFocused ? "border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
