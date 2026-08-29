export interface ThreatChip {
  id: string
  label: string
  severity: "critical" | "high" | "medium" | "low"
  explanation: string
  detectedPattern: string
}

export interface BreakdownBar {
  label: string
  percentage: number
  color: string
}

export interface UrlSegment {
  text: string
  label: "PROTOCOL" | "SUBDOMAIN" | "DOMAIN" | "TLD" | "PATH" | "PARAMS"
  isSuspicious: boolean
}

export interface LiveSignal {
  id: string
  text: string
  status: "pass" | "warn" | "fail"
}

export interface ScanItem {
  id: string
  inputType: "url" | "message"
  content: string
  riskScore: number // 0-100
  riskLevel: "CRITICAL" | "HIGH RISK" | "MEDIUM RISK" | "LOW RISK" | "SAFE"
  threatType: string
  verdict?: string
  confidence: number // percentage e.g. 94
  timestamp: string
  signalsCount: number
  chips: ThreatChip[]
  breakdown: BreakdownBar[]
  urlSegments?: UrlSegment[]
  liveSignals: LiveSignal[]
  aiExplanation: string
  structuredExplanation?: {
    summary: string
    detailed_reasoning: string
    attacker_intent: string
    real_world_comparison: string
  }
  recommendedActions: {
    title: string
    detail: string
    isBlock?: boolean
  }[]
}

export interface ExamplePreset {
  title: string
  type: "url" | "message"
  content: string
  tag: string
}

export const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    title: "Urgent Security Lock",
    type: "message",
    content: "Your account will be suspended. Verify now at https://secure-login.paypa1-checkpoint.net/verify/account?token=x9283",
    tag: "Banking Phish"
  },
  {
    title: "Package Delivery Failed",
    type: "message",
    content: "Your package delivery failed. Confirm your shipping address immediately to reschedule delivery: http://usps-tracking-redelivery-portal.org/claim",
    tag: "Delivery Scam"
  },
  {
    title: "Unusual Login Detected",
    type: "url",
    content: "https://auth.chase-secure-verification.com/login?session=usr_9012",
    tag: "Credential Theft"
  }
]

export const MOCK_SCANS: ScanItem[] = [
  {
    id: "SCN-90241",
    inputType: "url",
    content: "https://secure-login.paypa1-checkpoint.net/verify/account?token=x9283",
    riskScore: 87,
    riskLevel: "HIGH RISK",
    threatType: "Brand Impersonation & Typosquatting",
    confidence: 94,
    timestamp: "2026-08-29 11:24:12",
    signalsCount: 5,
    chips: [
      {
        id: "chip-1",
        label: "🔴 Brand Impersonation",
        severity: "critical",
        explanation: "Spoofs trusted brand 'PayPal' by replacing letter 'l' with numeric digit '1' (paypa1).",
        detectedPattern: "paypa1-checkpoint.net"
      },
      {
        id: "chip-2",
        label: "🟠 Suspicious Domain",
        severity: "high",
        explanation: "Domain was registered 2 days ago under privacy proxy WHOIS protection.",
        detectedPattern: "Age: 48 Hours"
      },
      {
        id: "chip-3",
        label: "🟠 Urgency Language",
        severity: "high",
        explanation: "Contains high-stress panic triggers ('account suspended', 'verify now').",
        detectedPattern: "NLP Urgency Token: 92%"
      },
      {
        id: "chip-4",
        label: "🟡 Credential Request",
        severity: "medium",
        explanation: "Form action targets unencrypted endpoint capturing plain passwords.",
        detectedPattern: "Form POST /verify"
      },
      {
        id: "chip-5",
        label: "🟡 Unusual URL Structure",
        severity: "medium",
        explanation: "Uses multi-tiered subdomains ('secure-login.') to obscure actual root domain.",
        detectedPattern: "Subdomain Depth: 3"
      }
    ],
    breakdown: [
      { label: "Domain Structure", percentage: 82, color: "bg-rose-500" },
      { label: "URL Pattern", percentage: 71, color: "bg-orange-500" },
      { label: "Social Engineering", percentage: 91, color: "bg-rose-500" },
      { label: "Credential Request", percentage: 84, color: "bg-amber-500" }
    ],
    urlSegments: [
      { text: "https://", label: "PROTOCOL", isSuspicious: false },
      { text: "secure-login.", label: "SUBDOMAIN", isSuspicious: true },
      { text: "paypa1-checkpoint", label: "DOMAIN", isSuspicious: true },
      { text: ".net", label: "TLD", isSuspicious: true },
      { text: "/verify/account", label: "PATH", isSuspicious: false }
    ],
    liveSignals: [
      { id: "ls-1", text: "HTTPS SSL Handshake Check", status: "pass" },
      { id: "ls-2", text: "Domain Registration Age Telemetry", status: "fail" },
      { id: "ls-3", text: "Typosquat Character Similarity Match", status: "fail" },
      { id: "ls-4", text: "NLP Panic & Urgency Sentiment", status: "warn" },
      { id: "ls-5", text: "Credential Harvesting Form Action", status: "fail" }
    ],
    aiExplanation: "The analyzed target exhibits classic characteristics of a targeted PayPal brand impersonation attack. The embedded domain uses homograph character substitution ('paypa1') registered 2 days ago under privacy protection, combined with artificial urgency keywords ('account suspended') to panic victims into submitting credentials.",
    structuredExplanation: {
      summary: "This URL is a high-risk brand impersonation attack targeting PayPal account credentials.",
      detailed_reasoning: "The domain 'paypa1-checkpoint.net' uses leetspeak character substitution ('1' instead of 'l') to deceive users into trusting a spoofed login form. The domain was registered within the last 48 hours under privacy proxy protection and utilizes unencrypted transport.",
      attacker_intent: "The threat actor is actively intercepting PayPal usernames, passwords, and 2FA authentication tokens for unauthorized financial exfiltration.",
      real_world_comparison: "Classic typosquatting credential harvesting portal targeting financial consumers."
    },
    recommendedActions: [
      { title: "Do not click this link or submit any passwords.", detail: "This domain is a high-confidence credential phishing clone.", isBlock: true },
      { title: "Open official website or app manually.", detail: "Navigate directly to paypal.com in a new clean browser window." },
      { title: "Never share OTP or password.", detail: "Legitimate organizations will never request passcodes via unverified SMS or third-party links." }
    ]
  },
  {
    id: "SCN-88192",
    inputType: "message",
    content: "URGENT: Your account will be suspended within 2 hours due to unverified activity. Verify now at https://auth.chase-secure-verification.com/login",
    riskScore: 94,
    riskLevel: "CRITICAL",
    threatType: "Smishing Credential Harvest",
    confidence: 98,
    timestamp: "2026-08-29 10:45:00",
    signalsCount: 4,
    chips: [
      {
        id: "chip-6",
        label: "🔴 Bank Impersonation",
        severity: "critical",
        explanation: "Impersonates Chase financial institution with fake auth domain.",
        detectedPattern: "chase-secure-verification.com"
      },
      {
        id: "chip-7",
        label: "🔴 Strict Deadline Threat",
        severity: "critical",
        explanation: "Imposes 2-hour deadline to induce panic.",
        detectedPattern: "'within 2 hours'"
      }
    ],
    breakdown: [
      { label: "Domain Structure", percentage: 95, color: "bg-rose-500" },
      { label: "URL Pattern", percentage: 88, color: "bg-rose-500" },
      { label: "Social Engineering", percentage: 98, color: "bg-rose-500" },
      { label: "Credential Request", percentage: 92, color: "bg-rose-500" }
    ],
    liveSignals: [
      { id: "ls-6", text: "Sender Authority Alignment", status: "fail" },
      { id: "ls-7", text: "Domain Age & Registrar Telemetry", status: "fail" },
      { id: "ls-8", text: "SMS Phishing Pattern Correlation", status: "fail" }
    ],
    aiExplanation: "Confirmed smishing vector. Synthesized language analysis matched 98.4% correlation with active financial bank credential harvesting campaigns. The linked URL was created 24 hours ago and has zero valid banking MX records.",
    structuredExplanation: {
      summary: "This message is a fraudulent banking lure engineered to hijack Chase accounts through artificial urgency.",
      detailed_reasoning: "The text manufactures an artificial crisis ('suspended within 2 hours') to trigger panic and bypass critical thinking. The destination link 'chase-secure-verification.com' is an unregistered imposter domain mimicking Chase's authentic single-sign-on gateway.",
      attacker_intent: "The adversary seeks to harvest online banking credentials, one-time SMS passcodes, and security challenge responses.",
      real_world_comparison: "High-urgency SMS smishing campaign targeting retail banking customers."
    },
    recommendedActions: [
      { title: "Do not click this link or submit any passwords.", detail: "Quarantined smishing threat.", isBlock: true },
      { title: "Open the official website or app manually.", detail: "Log into chase.com directly in your browser." },
      { title: "Never share OTP or password.", detail: "Banks do not request security OTPs over SMS links." }
    ]
  },
  {
    id: "SCN-66120",
    inputType: "url",
    content: "https://github.com/settings/security-log",
    riskScore: 4,
    riskLevel: "SAFE",
    verdict: "Verified Safe Domain",
    threatType: "Official Developer Platform",
    confidence: 99,
    timestamp: "2026-08-29 08:05:14",
    signalsCount: 0,
    chips: [],
    breakdown: [
      { label: "Domain Structure", percentage: 2, color: "bg-emerald-500" },
      { label: "URL Pattern", percentage: 4, color: "bg-emerald-500" },
      { label: "Social Engineering", percentage: 0, color: "bg-emerald-500" },
      { label: "Credential Request", percentage: 0, color: "bg-emerald-500" }
    ],
    urlSegments: [
      { text: "https://", label: "PROTOCOL", isSuspicious: false },
      { text: "github", label: "DOMAIN", isSuspicious: false },
      { text: ".com", label: "TLD", isSuspicious: false },
      { text: "/settings/security-log", label: "PATH", isSuspicious: false }
    ],
    liveSignals: [
      { id: "ls-9", text: "EV SSL Certificate Verification", status: "pass" },
      { id: "ls-10", text: "Domain Age & Reputation Check (18 Years)", status: "pass" }
    ],
    aiExplanation: "Target URL belongs to official GitHub domain infrastructure. Valid EV SSL certificate, long-standing domain reputation (18 years), and zero threat indicators detected.",
    structuredExplanation: {
      summary: "This URL points to verified official GitHub infrastructure and poses no security threat.",
      detailed_reasoning: "The domain 'github.com' resolves to authentic Microsoft/GitHub autonomous system numbers with valid Extended Validation SSL certificates. Standard authenticated path with zero heuristic anomalies.",
      attacker_intent: "No malicious intent detected; authentic developer platform access.",
      real_world_comparison: "Standard legitimate cloud developer service."
    },
    recommendedActions: [
      { title: "URL is verified safe to navigate.", detail: "Legitimate GitHub platform domain." }
    ]
  }
]
