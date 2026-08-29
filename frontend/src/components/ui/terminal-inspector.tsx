import * as React from "react"
import { Layers, Copy, Check } from "lucide-react"
import { type UrlSegment } from "@/data/mockData"
import { cn } from "@/lib/utils"

interface TerminalInspectorProps {
  segments: UrlSegment[]
  fullUrl?: string
  className?: string
}

export const TerminalInspector: React.FC<TerminalInspectorProps> = ({
  segments,
  fullUrl,
  className
}) => {
  const [copied, setCopied] = React.useState<boolean>(false)

  const handleCopy = () => {
    if (fullUrl) {
      navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={cn("rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs shadow-md overflow-hidden max-w-full", className)}>
      {/* Terminal Top Window Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold ml-2 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            url_inspector.sh
          </span>
        </div>

        {fullUrl && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors min-h-[32px] px-2 py-1 rounded cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Terminal Syntax Highlight Segment Display */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          {segments.map((segment, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg border transition-all max-w-full ${
                segment.isSuspicious
                  ? "border-rose-500/50 bg-rose-950/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                  : "border-slate-800 bg-slate-950/80 text-slate-300"
              }`}
            >
              <span className="font-bold tracking-tight break-all text-center">{segment.text}</span>
              <span
                className={`text-[9px] font-mono mt-1 px-1 rounded uppercase ${
                  segment.isSuspicious
                    ? "bg-rose-500/20 text-rose-400 font-bold"
                    : "text-slate-500"
                }`}
              >
                {segment.label}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 font-mono pt-1">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span> High Risk Component Flagged
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-slate-600"></span> Standard Structure
          </span>
        </div>
      </div>
    </div>
  )
}
