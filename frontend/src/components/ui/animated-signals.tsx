import * as React from "react"
import { CheckCircle2, AlertTriangle, Radio } from "lucide-react"

interface SignalItem {
  id: string
  text: string
  status: "pass" | "warn" | "fail"
}

interface AnimatedSignalsProps {
  signals: SignalItem[]
  currentStep: number
}

export const AnimatedSignals: React.FC<AnimatedSignalsProps> = ({ signals, currentStep }) => {
  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/90 p-4 sm:p-6 space-y-4 font-mono text-xs shadow-lg max-w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
          <Radio className="h-4 w-4 animate-pulse text-cyan-400" />
          LIVE HEURISTIC SIGNAL FEED
        </span>
        <span className="text-[11px] text-slate-500">Pipeline Active...</span>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {signals.map((sig, idx) => {
          const isVisible = idx <= currentStep
          const isCurrent = idx === currentStep

          return (
            <div
              key={sig.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 gap-2 min-h-[44px] ${
                isVisible
                  ? sig.status === "pass"
                    ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                    : sig.status === "warn"
                    ? "border-amber-500/30 bg-amber-950/20 text-amber-300"
                    : "border-rose-500/30 bg-rose-950/20 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                  : "border-slate-900 bg-slate-950/40 text-slate-700 opacity-20"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {sig.status === "pass" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className={`h-4 w-4 shrink-0 ${sig.status === "warn" ? "text-amber-400" : "text-rose-400"}`} />
                )}
                <span className="font-semibold text-xs truncate xs:overflow-visible xs:whitespace-normal">{sig.text}</span>
              </div>

              {isCurrent && (
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 animate-pulse shrink-0">
                  EVALUATING
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
