import React from "react"
import {
  Shield,
  Globe,
  Cpu,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  MessageSquare,
  Network,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/lightswind/badge"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { CardSpotlight } from "@/components/ui/card-spotlight"

interface HowItWorksPageProps {
  onNavigate: (page: string) => void
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      number: "01",
      title: "Ingest & Tokenize",
      badge: "INPUT",
      icon: Globe,
      color: "from-cyan-500 to-blue-600",
      description:
        "Paste any suspicious URL, domain, or message text (SMS, email, chat). The parser separates protocols, isolated subdomains, query parameters, and plain-text tokens in real time."
    },
    {
      number: "02",
      title: "Rule-Based Heuristic Scan",
      badge: "DETECTION",
      icon: Cpu,
      color: "from-blue-500 to-indigo-600",
      description:
        "Evaluates string similarity (Levenshtein distance) against 25+ high-value target brands, flags high-risk disposable TLDs (.xyz, .top), raw IP addresses, and detects urgency panic triggers."
    },
    {
      number: "03",
      title: "Gemini AI Threat Synthesis",
      badge: "INTELLIGENCE",
      icon: Sparkles,
      color: "from-purple-500 to-pink-600",
      description:
        "Detected heuristic markers are piped to Google Gemini AI to generate an authoritative, 2-3 sentence plain-language explanation revealing the attacker's deception strategy and intent."
    },
    {
      number: "04",
      title: "Explainable Risk Score",
      badge: "VERDICT",
      icon: ShieldCheck,
      color: "from-emerald-500 to-cyan-500",
      description:
        "Aggregates signals into an intuitive 0–100 risk score (LOW to CRITICAL) with category breakdowns, confidence rating, and recommended defensive actions."
    }
  ]

  const categories = [
    {
      title: "Domain Structure",
      icon: Network,
      color: "text-cyan-400",
      border: "border-cyan-500/30",
      bgGlow: "rgba(6, 182, 212, 0.15)",
      checks: [
        "Levenshtein brand typosquatting (e.g. paypa1, arnaz0n)",
        "Raw IPv4 address host instead of valid domain",
        "Excessive nested subdomains (> 2 tiers) masking true authority",
        "High-risk disposable TLDs (.xyz, .top, .click, .buzz, .info)"
      ]
    },
    {
      title: "URL Patterns",
      icon: Globe,
      color: "text-sky-400",
      border: "border-sky-500/30",
      bgGlow: "rgba(56, 189, 248, 0.15)",
      checks: [
        "Known URL shortening services (bit.ly, tinyurl, t.co)",
        "Embedded '@' credential redirect trick",
        "Unencrypted plain HTTP connection",
        "Obfuscated base64 and tokenized redirection query strings"
      ]
    },
    {
      title: "Social Engineering",
      icon: MessageSquare,
      color: "text-purple-400",
      border: "border-purple-500/30",
      bgGlow: "rgba(168, 85, 247, 0.15)",
      checks: [
        "Artificial urgency triggers ('verify now', 'within 24 hours')",
        "Coercive account suspension and deadline warnings",
        "Deceptive reward hooks ('you have won', 'unclaimed parcel')",
        "Impersonation of corporate IT or banking departments"
      ]
    },
    {
      title: "Credential Harvesting",
      icon: Lock,
      color: "text-rose-400",
      border: "border-rose-500/30",
      bgGlow: "rgba(244, 63, 94, 0.15)",
      checks: [
        "Explicit requests for passwords, passcodes, or PINs",
        "Two-factor authentication interception (OTP solicitation)",
        "Payment card details, CVV codes, or bank account requests",
        "Social security number (SSN) or identity data requests"
      ]
    }
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-12 sm:space-y-16 pb-24 overflow-x-hidden font-mono">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4 sm:pt-6 px-2">
        <Badge variant="info" className="px-4 py-1.5 gap-2 text-xs">
          <Zap className="h-4 w-4" />
          SYSTEM ARCHITECTURE & METHODOLOGY
        </Badge>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          How PhishGuard Works
        </h1>
        <p className="mx-auto max-w-2xl text-xs sm:text-base text-slate-300 leading-relaxed font-sans font-normal px-2">
          A dual-layer defense architecture uniting real-time rule-based heuristics with Google Gemini AI natural language threat modeling.
        </p>
      </div>

      {/* 4-Step Visual Process Flow */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <Shield className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-extrabold text-white">4-Stage Analysis Pipeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <CardSpotlight
                key={idx}
                className="p-6 space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-slate-800/90"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0`}>
                      <Icon className="h-5 w-5 text-slate-950 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">STEP {step.number}</span>
                      <h3 className="text-base font-bold text-white leading-snug">{step.title}</h3>
                    </div>
                  </div>

                  <Badge variant="outline" size="sm" withDot={false} className="text-[10px]">
                    {step.badge}
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                  {step.description}
                </p>
              </CardSpotlight>
            )
          })}
        </div>
      </div>

      {/* Detection Categories Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <AlertTriangle className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-extrabold text-white">Heuristic Detection Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat, idx) => {
            const CatIcon = cat.icon
            return (
              <CardSpotlight
                key={idx}
                spotlightColor={cat.bgGlow}
                className={`p-6 space-y-4 ${cat.border} shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <CatIcon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <h3 className={`text-base font-bold ${cat.color}`}>
                    {cat.title}
                  </h3>
                </div>

                <ul className="space-y-2 pt-1 font-sans text-xs text-slate-300">
                  {cat.checks.map((item, checkIdx) => (
                    <li key={checkIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${cat.color}`} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardSpotlight>
            )
          })}
        </div>
      </div>

      {/* Dual Engine Synergy Callout */}
      <CardSpotlight className="p-6 sm:p-8 border-cyan-500/40 cyber-glass-glow text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Sparkles className="h-7 w-7 animate-pulse" />
        </div>
        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-xl font-black text-white">Rule Heuristics + Generative AI</h3>
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            While heuristic rules rapidly catch known domain tricks, typosquats, and keyword signatures with zero latency, Gemini AI analyzes the nuanced psychological context to explain exactly <em>why</em> an attack is deceptive.
          </p>
        </div>

        <div className="pt-2">
          <ShimmerButton
            onClick={() => onNavigate("scanner")}
            className="px-8 py-3 text-xs tracking-wider font-bold"
          >
            <span>Try the Scanner Now</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </ShimmerButton>
        </div>
      </CardSpotlight>

    </div>
  )
}
