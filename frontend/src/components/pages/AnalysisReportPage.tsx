import React, { useState } from "react"
import {
  RotateCcw,
  Download,
  AlertTriangle,
  Ban,
  Check,
  Cpu,
  Loader2,
  CheckCircle2,
  Target
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type ScanItem } from "@/data/mockData"
import { exportReportPDF } from "@/lib/pdf-export"
import { Badge } from "@/components/lightswind/badge"
import { Button } from "@/components/lightswind/button"
import { LiquidGlassCard } from "@/components/lightswind/liquid-glass-card"
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { RadialScore } from "@/components/ui/radial-score"
import { TerminalInspector } from "@/components/ui/terminal-inspector"

interface AnalysisReportPageProps {
  scan: ScanItem
  onNavigate: (page: string) => void
}

export const AnalysisReportPage: React.FC<AnalysisReportPageProps> = ({ scan, onNavigate }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const handleExport = async () => {
    if (isExporting) return

    setIsExporting(true)
    setFeedbackToast(null)

    try {
      // Allow UI to render spinner before synchronous PDF block
      await new Promise((resolve) => setTimeout(resolve, 150))
      await exportReportPDF(scan)

      setFeedbackToast({
        type: "success",
        message: `Report downloaded: PhishGuard-Report-${scan.id}.pdf`
      })
      setTimeout(() => setFeedbackToast(null), 4000)
    } catch (err) {
      console.error("PDF generation failed:", err)
      setFeedbackToast({
        type: "error",
        message: "Failed to generate PDF. Please try again."
      })
      setTimeout(() => setFeedbackToast(null), 4000)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8 pb-20 font-mono overflow-x-hidden relative">
      
      {/* Export Toast Notification */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs shadow-2xl backdrop-blur-xl ${
              feedbackToast.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20"
                : "bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-rose-500/20"
            }`}
          >
            {feedbackToast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{feedbackToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase flex-wrap">
            <span>Scan Audit Report #{scan.id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{scan.timestamp}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Analysis Report
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => onNavigate("scanner")}
            variant="outline"
            size="default"
            className="flex-1 sm:flex-none min-h-[44px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Scan</span>
          </Button>

          {/* Real PDF Export Button with Loading State */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="glow"
            size="default"
            className="flex-1 sm:flex-none min-h-[44px] min-w-[150px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Export Report</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Target Content Banner (CardSpotlight) */}
      <CardSpotlight className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs text-slate-300">
        <span className="text-slate-500 font-bold uppercase shrink-0">Target ({scan.inputType}):</span>
        <span className="text-slate-200 break-all font-mono">{scan.content}</span>
      </CardSpotlight>

      {/* Score & Classification */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <LiquidGlassCard
          variant={scan.riskScore >= 80 ? "primary" : scan.riskScore >= 40 ? "cyan" : "emerald"}
          glow={true}
          className="lg:col-span-5 p-4 flex flex-col items-center justify-center"
        >
          <RadialScore
            score={scan.riskScore}
            riskLevel={scan.riskLevel}
            confidence={scan.confidence}
          />
        </LiquidGlassCard>

        {/* Primary Classification with 3D Tilt CardSpotlight */}
        <CardSpotlight className="lg:col-span-7 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <CardHeader>
            <div className="text-xs text-cyan-400 uppercase font-bold">Primary Threat Type</div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-white pt-1 break-words leading-tight">
              {scan.threatType}
            </CardTitle>
            <CardDescription className="pt-2 text-slate-300 text-xs">
              Target content was evaluated using NLP social engineering heuristics, domain SSL telemetry, and typosquat character matching algorithms.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="pt-4 border-t border-slate-800/80 flex flex-col xs:flex-row xs:items-center justify-between gap-2 text-xs text-slate-400">
              <span>Signals Triggered: <Badge variant="destructive" size="sm">{scan.chips.length}</Badge></span>
              <span>Status: <Badge variant="info" size="sm">Analysis Complete</Badge></span>
            </div>
          </CardContent>
        </CardSpotlight>
      </div>

      {/* Threat Signals */}
      <CardSpotlight>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Threat Signals Identified</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          {scan.chips.length === 0 ? (
            <div className="py-6 text-center text-xs text-emerald-400 font-bold">
              ✓ Zero malicious signals detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scan.chips.map((chip) => (
                <div key={chip.id} className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-200 flex-wrap gap-1">
                    <Badge variant={chip.severity === "critical" ? "destructive" : "warning"} size="sm">
                      {chip.label}
                    </Badge>
                    <span className="text-[10px] text-slate-500">{chip.detectedPattern}</span>
                  </div>
                  <p className="text-xs font-sans text-slate-400 leading-relaxed pt-1">
                    {chip.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </CardSpotlight>

      {/* Visual URL Inspector */}
      {scan.urlSegments && (
        <TerminalInspector
          segments={scan.urlSegments}
          fullUrl={scan.content}
        />
      )}

      {/* AI Security Analyst Purple Panel */}
      {(scan.aiExplanation || scan.structuredExplanation) && (
        <div className="rounded-2xl cyber-glass-purple p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-300 font-mono">
              <Cpu className="h-4 w-4 text-purple-400 animate-pulse shrink-0" />
              <span>AI SECURITY ANALYST</span>
            </div>
            <Badge variant="outline" size="sm" withDot={false} className="border-purple-400/40 text-purple-300 text-[10px]">
              Gemini Telemetry
            </Badge>
          </div>

          {(() => {
            const aiData = scan.structuredExplanation || (typeof scan.aiExplanation === "object" ? (scan.aiExplanation as any) : null)

            if (aiData) {
              return (
                <div className="space-y-4">
                  {/* 1. SUMMARY: Prominent headline verdict (larger, bolder text) */}
                  {aiData.summary && (
                    <div>
                      <p className="text-base sm:text-lg font-bold text-white font-sans leading-snug tracking-tight">
                        {aiData.summary}
                      </p>
                    </div>
                  )}

                  {/* 2. DETAILED REASONING: Main explanation paragraph (normal body text) */}
                  {aiData.detailed_reasoning && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans font-normal">
                      {aiData.detailed_reasoning}
                    </p>
                  )}

                  {/* 3. ATTACKER INTENT: Small highlighted sub-card with target/crosshair icon and distinctive tint */}
                  {aiData.attacker_intent && (
                    <div className="rounded-xl border border-purple-400/35 bg-purple-950/50 p-3.5 sm:p-4 space-y-1.5 shadow-[0_0_20px_rgba(168,85,247,0.12)]">
                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-purple-200 uppercase tracking-wider">
                        <Target className="h-4 w-4 text-purple-400 shrink-0" />
                        <span>ATTACKER INTENT</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {aiData.attacker_intent}
                      </p>
                    </div>
                  )}

                  {/* 4. REAL WORLD COMPARISON: Small footnote/tag below, subtle muted styling */}
                  {aiData.real_world_comparison && (
                    <div className="flex items-center gap-2 pt-2 border-t border-purple-500/15 text-[11px] font-sans text-purple-300/80">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-purple-400 font-semibold shrink-0">
                        Reference Pattern:
                      </span>
                      <span className="italic truncate">
                        {aiData.real_world_comparison}
                      </span>
                    </div>
                  )}
                </div>
              )
            }

            return (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {typeof scan.aiExplanation === "string" ? scan.aiExplanation : ""}
              </p>
            )
          })()}
        </div>
      )}

      {/* Recommended Actions with CardSpotlight */}
      <CardSpotlight className="border-rose-500/40 bg-rose-950/20">
        <CardHeader className="border-rose-500/30 pb-3">
          <CardTitle className="text-rose-300 flex items-center gap-2 text-sm sm:text-base font-bold">
            <Ban className="h-5 w-5 text-rose-400 shrink-0" />
            <span>RECOMMENDED ACTION</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-xs pt-4">
          {scan.recommendedActions.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              {item.isBlock ? <Ban className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" /> : <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <div className="font-bold text-slate-100">{item.title}</div>
                <div className="text-slate-400 font-sans text-xs">{item.detail}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </CardSpotlight>
    </div>
  )
}
