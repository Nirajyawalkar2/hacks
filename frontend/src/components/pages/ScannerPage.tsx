import React, { useState, useRef } from "react"
import {
  Globe,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Shield,
  Loader2,
  Zap,
  Cpu,
  Ban,
  Check,
  ShieldCheck,
  CheckCircle2,
  Target
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  EXAMPLE_PRESETS,
  type ExamplePreset,
  type ScanItem,
  type ThreatChip
} from "@/data/mockData"
import { analyzeThreatAPI } from "@/services/api"
import { analyzeLocally } from "@/lib/localThreatEngine"
import { triggerScanCelebration } from "@/lib/celebration"
import { Badge } from "@/components/lightswind/badge"
import { Progress } from "@/components/lightswind/progress"
import { LiquidGlassCard } from "@/components/lightswind/liquid-glass-card"
import { Button } from "@/components/lightswind/button"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Input } from "@/components/lightswind/input"
import { Textarea } from "@/components/lightswind/textarea"
import { RadialScore } from "@/components/ui/radial-score"
import { TerminalInspector } from "@/components/ui/terminal-inspector"
import { AnimatedSignals } from "@/components/ui/animated-signals"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CardSpotlight } from "@/components/ui/card-spotlight"

interface ScannerPageProps {
  activeScan?: ScanItem
  onScanComplete: (result: ScanItem) => void
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ activeScan, onScanComplete }) => {
  const [inputType, setInputType] = useState<"url" | "message">("url")
  const [inputText, setInputText] = useState<string>("")
  const [isScanning, setIsScanning] = useState<boolean>(false)
  const [currentResult, setCurrentResult] = useState<ScanItem | null>(activeScan || null)
  const [selectedChip, setSelectedChip] = useState<ThreatChip | null>(null)
  const [liveStep, setLiveStep] = useState<number>(0)
  const [justCompletedScan, setJustCompletedScan] = useState<boolean>(false)

  // Guard against re-triggering celebration on component re-render
  const lastCelebratedScanIdRef = useRef<string | null>(null)

  const handleExampleClick = (preset: ExamplePreset) => {
    setInputType(preset.type)
    setInputText(preset.content)
  }

  const handleClear = () => {
    setInputText("")
  }

  const handleScanFinished = (result: ScanItem) => {
    setCurrentResult(result)
    onScanComplete(result)

    if (lastCelebratedScanIdRef.current !== result.id) {
      lastCelebratedScanIdRef.current = result.id
      // Trigger confetti only for verified SAFE risk
      triggerScanCelebration(result.riskScore, result.riskLevel)
      if (result.riskLevel === "SAFE") {
        setJustCompletedScan(true)
        setTimeout(() => setJustCompletedScan(false), 3200)
      }
    }
  }

  const handleAnalyze = async () => {
    if (!inputText.trim()) return

    setIsScanning(true)
    setLiveStep(0)

    const interval = setInterval(() => {
      setLiveStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 450)

    try {
      const result = await analyzeThreatAPI(inputType, inputText)
      setTimeout(() => {
        clearInterval(interval)
        setIsScanning(false)
        handleScanFinished(result)
      }, 700)
    } catch (err) {
      console.warn("Backend API call failed, using client-side heuristic engine:", err)
      setTimeout(() => {
        clearInterval(interval)
        setIsScanning(false)
        const generatedResult = analyzeLocally(inputType, inputText)
        handleScanFinished(generatedResult)
      }, 800)
    }
  }

  const getChipVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "warning"
      default:
        return "warning"
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 sm:space-y-12 pb-20 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-3 sm:space-y-4 pt-2 sm:pt-4 px-2">
        <Badge variant="info" className="px-4 py-1.5 gap-2 text-xs">
          <Zap className="h-4 w-4" />
          REAL-TIME HEURISTIC THREAT DETECTOR
        </Badge>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Analyze Before You Click.
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-base text-slate-300 leading-relaxed font-sans font-normal px-2">
          Detect phishing signals, suspicious domains, and social-engineering patterns in seconds.
        </p>
      </div>

      {/* 2. LARGE PREMIUM SCANNER PANEL (Aceternity 3D Card Spotlight) */}
      <CardSpotlight className="cyber-glass-glow border-cyan-500/40 p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        
        {/* Top Mode Selector Tabs with Sliding Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-slate-800/80 pb-4 sm:pb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs w-full sm:w-auto">
            <button
              onClick={() => setInputType("url")}
              className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-4 py-2 min-h-[38px] transition-colors cursor-pointer select-none ${
                inputType === "url" ? "text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {inputType === "url" && (
                <motion.div
                  layoutId="scanner-mode-pill"
                  className="absolute inset-0 rounded-xl bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>URL MODE</span>
              </span>
            </button>

            <button
              onClick={() => setInputType("message")}
              className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-4 py-2 min-h-[38px] transition-colors cursor-pointer select-none ${
                inputType === "message" ? "text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {inputType === "message" && (
                <motion.div
                  layoutId="scanner-mode-pill"
                  className="absolute inset-0 rounded-xl bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>MESSAGE MODE</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 font-mono self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Zero Log Retention • Local Heuristic Pass</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            {inputType === "url" ? (
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isScanning}
                placeholder="Paste a suspicious URL here (e.g. https://secure-login.paypa1-checkpoint.net/verify)..."
              />
            ) : (
              <Textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isScanning}
                placeholder="Paste a suspicious message, email or SMS here (e.g. 'Your account will be suspended...')"
              />
            )}
            {isScanning && <div className="animate-scan-line"></div>}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <span className="text-[11px] sm:text-xs font-mono text-slate-400 font-semibold">
              Input Length: {inputText.length} characters
            </span>

            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {inputText && !isScanning && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleClear}
                  className="flex-1 sm:flex-none min-h-[44px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </Button>
              )}

              {/* ShimmerButton CTA with BorderBeam */}
              <ShimmerButton
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isScanning}
                className="flex-1 sm:flex-none min-h-[44px] px-7 py-2.5 text-xs tracking-wider"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    <span>ANALYZING THREAT...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-slate-950" />
                    <span>ANALYZE THREAT →</span>
                  </>
                )}
              </ShimmerButton>
            </div>
          </div>
        </div>
      </CardSpotlight>

      {/* 3. LANDING / EMPTY STATE (Before Scan) */}
      {!currentResult && !isScanning && (
        <CardSpotlight className="p-6 sm:p-12 text-center space-y-5 sm:space-y-6 bg-slate-900/40 border-slate-800/80 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl border border-cyan-500/40 bg-slate-950/90 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-cyan-400 stroke-[1.75]" />
          </div>

          <div className="space-y-1.5 sm:space-y-2 max-w-lg mx-auto">
            <h3 className="text-lg sm:text-xl font-mono font-extrabold text-white">Scanner Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              No scan active. Paste suspicious content above or click a preset sample below to test immediately.
            </p>
          </div>

          {/* Clickable Preset Buttons */}
          <div className="pt-3 sm:pt-4 max-w-3xl mx-auto space-y-3">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Try an example:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {EXAMPLE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(preset)}
                  className="rounded-xl border border-slate-800/90 bg-slate-950/90 p-4 text-left hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all space-y-2 group shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] min-h-[44px] cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-200 font-bold group-hover:text-cyan-400 transition-colors">
                    <span className="truncate pr-2">{preset.title}</span>
                    <Badge variant="outline" size="sm" withDot={false} className="shrink-0 text-[10px]">
                      {preset.tag}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {preset.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </CardSpotlight>
      )}

      {/* 4. LIVE SIGNAL FEED (Animated Signal Feed) */}
      {isScanning && currentResult && (
        <AnimatedSignals
          signals={currentResult.liveSignals}
          currentStep={liveStep}
        />
      )}

      {/* 5. THREAT ASSESSMENT RESULT SECTION */}
      {currentResult && !isScanning && (
        <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-500">
          
          {/* Header Badge */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-slate-800/80 pb-3 font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
            <span className="truncate">THREAT ASSESSMENT RESULT #{currentResult.id}</span>
            <Badge variant="outline" withDot={false} size="sm">{currentResult.timestamp}</Badge>
          </div>

          {/* Radial Score Dial & Verdict Header with Celebration Pulse & Visual Cue */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            <div className="relative lg:col-span-5 flex flex-col items-center justify-center">
              {/* Expanding Alert Wave Pulse for High/Critical Risk scans */}
              <AnimatePresence>
                {justCompletedScan && currentResult.riskScore > 60 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.95 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute -inset-2 rounded-3xl border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.6)] pointer-events-none z-20"
                  />
                )}
              </AnimatePresence>

              {/* Gentle Expanding Cyan Wave for Low/Medium scans */}
              <AnimatePresence>
                {justCompletedScan && currentResult.riskScore <= 60 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.85 }}
                    animate={{ scale: 1.12, opacity: 0 }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className="absolute -inset-2 rounded-3xl border-2 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)] pointer-events-none z-20"
                  />
                )}
              </AnimatePresence>

              <LiquidGlassCard
                variant={currentResult.riskScore >= 80 ? "primary" : currentResult.riskLevel === "SAFE" ? "emerald" : "cyan"}
                glow={true}
                className="w-full p-4 flex flex-col items-center justify-center relative"
              >
                {/* Floating "Scan Complete" Checkmark Pulse Badge Cue - ONLY for genuine SAFE platforms */}
                <AnimatePresence>
                  {justCompletedScan && currentResult.riskLevel === "SAFE" && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.85 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.85 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute top-3 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border shadow-xl bg-emerald-950/95 text-emerald-300 border-emerald-500/70 shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 animate-pulse shrink-0" />
                      <span>VERIFIED SAFE PLATFORM</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <RadialScore
                  score={currentResult.riskScore}
                  riskLevel={currentResult.riskLevel}
                  confidence={currentResult.confidence}
                />
              </LiquidGlassCard>
            </div>

            {/* Verdict Overview Card (7 cols) with 3D Tilt */}
            <CardSpotlight className="lg:col-span-7 flex flex-col justify-between shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <CardHeader>
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  PRIMARY CLASSIFICATION
                </div>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-white font-mono font-black pt-1 leading-tight break-words">
                  {currentResult.threatType}
                </CardTitle>
                <CardDescription className="pt-2 text-slate-300 font-sans text-xs leading-relaxed">
                  {currentResult.aiExplanation || (currentResult.chips.length > 0
                    ? "Target content analyzed against heuristic domain telemetry. Multiple suspicious signals were identified."
                    : "Target content analyzed against heuristic domain telemetry. Zero threat signals detected.")}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="pt-4 border-t border-slate-800/80 flex flex-col xs:flex-row xs:items-center justify-between gap-2 font-mono text-xs text-slate-400">
                  <span>Timestamp: <strong className="text-slate-200">{currentResult.timestamp}</strong></span>
                  <span>Signals Triggered: <Badge variant={currentResult.chips.length > 0 ? "destructive" : "success"} size="sm">{currentResult.chips.length}</Badge></span>
                </div>
              </CardContent>
            </CardSpotlight>
          </div>

          {/* "WHY IS THIS SUSPICIOUS?" INTERACTIVE 3D FLIP REVEAL CHIPS */}
          <CardSpotlight className="shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>Why is this suspicious?</span>
              </CardTitle>
              <span className="text-xs font-mono text-slate-400">Click chip for 3D explanation</span>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {currentResult.chips.length === 0 ? (
                <div className="py-4 text-center text-xs font-mono text-emerald-400 font-bold">
                  ✓ Zero threat signals detected. Content passed clean.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {currentResult.chips.map((chip) => (
                      <motion.div
                        key={chip.id}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        <Badge
                          variant={getChipVariant(chip.severity)}
                          interactive={true}
                          highlighted={selectedChip?.id === chip.id}
                          onClick={() => setSelectedChip(selectedChip?.id === chip.id ? null : chip)}
                          className="py-2 px-3.5 text-xs font-mono font-bold min-h-[38px] cursor-pointer"
                        >
                          {chip.label}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  {/* 3D Flip Reveal Container */}
                  <AnimatePresence mode="wait">
                    {selectedChip && (
                      <motion.div
                        key={selectedChip.id}
                        initial={{ opacity: 0, rotateX: -20, y: 10 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        exit={{ opacity: 0, rotateX: 20, y: -10 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        style={{ transformPerspective: 800 }}
                        className="rounded-xl border border-cyan-500/50 bg-slate-950/95 p-4 space-y-2 font-mono text-xs shadow-[0_0_25px_rgba(6,182,212,0.25)]"
                      >
                        <div className="flex items-center justify-between text-cyan-300 font-bold flex-wrap gap-2">
                          <span className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-cyan-400" />
                            {selectedChip.label}
                          </span>
                          <Badge variant="outline" withDot={false} size="sm">
                            Pattern: {selectedChip.detectedPattern}
                          </Badge>
                        </div>
                        <p className="text-slate-300 font-sans text-xs leading-relaxed">
                          {selectedChip.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </CardSpotlight>

          {/* ANALYSIS BREAKDOWN PROGRESS BARS (LIGHTSWIND PROGRESS) */}
          <CardSpotlight className="shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
                <span>Analysis Breakdown</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 font-mono text-xs">
              {currentResult.breakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-bold">{item.label}</span>
                    <span className="text-white font-extrabold">{item.percentage}%</span>
                  </div>
                  <Progress
                    value={item.percentage}
                    color={item.percentage >= 80 ? "danger" : item.percentage >= 60 ? "warning" : "default"}
                  />
                </div>
              ))}
            </CardContent>
          </CardSpotlight>

          {/* VISUAL URL INSPECTOR */}
          {currentResult.urlSegments && (
            <TerminalInspector
              segments={currentResult.urlSegments}
              fullUrl={currentResult.content}
            />
          )}

          {/* AI SECURITY ANALYST BLOCK (PURPLE ACCENT) */}
          {(currentResult.aiExplanation || currentResult.structuredExplanation) && (
            <div className="rounded-2xl cyber-glass-purple p-5 sm:p-6 space-y-4 shadow-[0_0_35px_rgba(168,85,247,0.15)]">
              {/* Section Header */}
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
                const aiData = currentResult.structuredExplanation || (typeof currentResult.aiExplanation === "object" ? (currentResult.aiExplanation as any) : null)

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

                // Fallback for raw string
                return (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {typeof currentResult.aiExplanation === "string" ? currentResult.aiExplanation : ""}
                  </p>
                )
              })()}
            </div>
          )}

          {/* RECOMMENDED ACTION */}
          <CardSpotlight className="border-rose-500/50 bg-rose-950/20 font-mono shadow-[0_0_35px_rgba(244,63,94,0.15)]">
            <CardHeader className="border-rose-500/30 pb-3">
              <CardTitle className="text-rose-300 flex items-center gap-2 text-sm sm:text-base font-bold">
                <Ban className="h-5 w-5 text-rose-400 shrink-0" />
                <span>RECOMMENDED ACTION</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-xs pt-4">
              {currentResult.recommendedActions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90">
                  {item.isBlock ? (
                    <Ban className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-slate-100">{item.title}</div>
                    <div className="text-slate-400 font-sans text-xs">{item.detail}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </CardSpotlight>

        </div>
      )}

    </div>
  )
}
