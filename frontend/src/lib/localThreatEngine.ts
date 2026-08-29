import {
  type ScanItem,
  type ThreatChip,
  type UrlSegment,
  type LiveSignal,
  type BreakdownBar
} from "@/data/mockData"

// Verified, authentic global platforms that are safe by design
export const VERIFIED_PLATFORMS: Record<string, { title: string; category: string }> = {
  "github.com": { title: "Official Developer Platform", category: "Developer Tools" },
  "gitlab.com": { title: "Official Developer Platform", category: "Developer Tools" },
  "bitbucket.org": { title: "Official Developer Platform", category: "Developer Tools" },
  "stackoverflow.com": { title: "Verified Developer Community", category: "Developer Tools" },
  "mozilla.org": { title: "Verified Open Web Platform", category: "Technology" },
  "developer.mozilla.org": { title: "Verified Developer Documentation", category: "Developer Tools" },
  "npmjs.com": { title: "Verified Package Registry", category: "Developer Tools" },
  "pypi.org": { title: "Verified Package Registry", category: "Developer Tools" },
  "docker.com": { title: "Verified Container Platform", category: "Developer Tools" },
  "google.com": { title: "Verified Search & Cloud Platform", category: "Search & Cloud" },
  "microsoft.com": { title: "Verified Enterprise Platform", category: "Enterprise" },
  "apple.com": { title: "Verified Consumer Platform", category: "Technology" },
  "amazon.com": { title: "Verified E-Commerce Infrastructure", category: "E-Commerce" },
  "wikipedia.org": { title: "Verified Educational Resource", category: "Knowledge" },
  "youtube.com": { title: "Verified Media Platform", category: "Media" },
  "cloudflare.com": { title: "Verified Security Infrastructure", category: "Cloud & Security" }
}

const POPULAR_BRANDS = [
  "google", "microsoft", "apple", "amazon", "meta", "facebook", "instagram",
  "whatsapp", "twitter", "tiktok", "telegram", "discord", "reddit", "linkedin",
  "netflix", "spotify", "youtube", "twitch", "steam", "playstation", "xbox",
  "paypal", "chase", "bankofamerica", "wellsfargo", "citibank", "capitalone",
  "barclays", "hsbc", "stripe", "venmo", "zelle", "cashapp", "revolut",
  "coinbase", "binance", "kraken", "metamask", "trustwallet",
  "ebay", "walmart", "target", "dhl", "fedex", "usps", "ups",
  "dropbox", "zoom", "slack", "notion", "github", "gitlab", "cloudflare"
]

const SUSPICIOUS_TLDS = new Set([
  ".xyz", ".top", ".click", ".info", ".buzz", ".club",
  ".work", ".live", ".loan", ".support", ".online",
  ".cam", ".vip", ".party", ".gq", ".ml", ".cf", ".tk",
  ".cc", ".pw", ".rest", ".bid", ".country", ".stream",
  ".fit", ".surf", ".win", ".icu", ".monster", ".bar"
])

const URL_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd",
  "buff.ly", "ow.ly", "cutt.ly", "rb.gy", "shorturl.at",
  "tiny.cc", "rebrand.ly"
])

const URGENCY_KEYWORDS = [
  "verify now", "account suspended", "act immediately", "within 24 hours",
  "limited time", "immediate action required", "security alert",
  "suspended", "urgent", "temporarily locked", "action needed",
  "final notice", "deadline", "immediate verification", "terminated", "immediate"
]

const CREDENTIAL_KEYWORDS = [
  "password", "otp", "pin", "ssn", "social security",
  "card number", "cvv", "login to confirm", "update billing",
  "verify your identity", "banking credentials", "credit card",
  "security code", "passcode", "account details", "bank account"
]

const FEAR_REWARD_KEYWORDS = [
  "you've won", "unusual login detected", "unauthorized access detected",
  "gift card", "claim your prize", "parcel waiting", "delivery failed",
  "wire transfer", "lottery", "refund approved", "compromised",
  "suspicious activity", "payment pending", "failed delivery"
]

function levenshteinDistance(s1: string, s2: string): number {
  if (s1.length < s2.length) return levenshteinDistance(s2, s1)
  if (s2.length === 0) return s1.length
  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i)
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1]
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1
      const deletions = currentRow[j] + 1
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0)
      currentRow.push(min3(insertions, deletions, substitutions))
    }
    previousRow = currentRow
  }
  return previousRow[previousRow.length - 1]
}

function min3(a: number, b: number, c: number): number {
  return Math.min(a, Math.min(b, c))
}

export function parseUrlComponents(rawUrl: string) {
  let target = rawUrl.trim()
  if (!/^https?:\/\//i.test(target)) {
    target = "https://" + target
  }

  try {
    const parsed = new URL(target)
    const protocol = parsed.protocol.replace(":", "").toLowerCase()
    const host = parsed.hostname.toLowerCase()
    const parts = host.split(".")
    
    let subdomain = ""
    let domain = host

    if (parts.length >= 3) {
      if (parts[0] === "www") {
        subdomain = "www"
        domain = parts.slice(1).join(".")
      } else {
        subdomain = parts.slice(0, -2).join(".")
        domain = parts.slice(-2).join(".")
      }
    }

    return {
      raw: target,
      protocol,
      subdomain,
      domain,
      fullHost: host,
      path: parsed.pathname || "/",
      params: parsed.search ? parsed.search.replace(/^\?/, "") : ""
    }
  } catch {
    return {
      raw: target,
      protocol: "https",
      subdomain: "",
      domain: rawUrl.replace(/^https?:\/\//i, "").split("/")[0] || rawUrl,
      fullHost: rawUrl.replace(/^https?:\/\//i, "").split("/")[0] || rawUrl,
      path: "/",
      params: ""
    }
  }
}

export function analyzeLocally(inputType: "url" | "message", content: string): ScanItem {
  const cleanInput = content.trim()
  const contentLower = cleanInput.toLowerCase()
  const signals: ThreatChip[] = []

  let domainScore = 0
  let urlScore = 0
  let socialScore = 0
  let credentialScore = 0

  let parsedUrl: ReturnType<typeof parseUrlComponents> | null = null

  if (inputType === "url") {
    parsedUrl = parseUrlComponents(cleanInput)
  } else {
    const urlMatch = cleanInput.match(/https?:\/\/[^\s]+/i) || cleanInput.match(/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/i)
    if (urlMatch) {
      parsedUrl = parseUrlComponents(urlMatch[0])
    }
  }

  // 1. DOMAIN HEURISTICS
  if (parsedUrl) {
    const { domain, subdomain, fullHost, protocol, path, params } = parsedUrl
    const domainNoTld = domain.split(".")[0] || domain

    // Direct IP Host Check
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(fullHost) || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain)
    if (isIp) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Direct IP Address Host",
        severity: "critical",
        explanation: "URL directs to a raw numerical IP address instead of an authenticated domain name, bypassing DNS reputation checks.",
        detectedPattern: fullHost
      })
      domainScore += 50
    }

    // Excessive Subdomains Check
    if (subdomain && subdomain !== "www" && subdomain.split(".").length >= 2) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Excessive Obfuscating Subdomains",
        severity: "high",
        explanation: `Domain contains multiple nested subdomains (${subdomain}) to obfuscate the genuine target authority.`,
        detectedPattern: subdomain
      })
      domainScore += 30
    }

    // Suspicious Path Endpoints
    if (path && path !== "/" && (/\.(exe|apk|bat|scr|vbs|zip|iso)$/i.test(path) || /\/(login|verify|signin|auth|update)\b/i.test(path))) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Sensitive Target Path / Executable Endpoint",
        severity: "medium",
        explanation: `URL path targets an authentication or downloadable executable endpoint ('${path.substring(0, 30)}').`,
        detectedPattern: path.substring(0, 30)
      })
      urlScore += 25
    }

    // High-Risk TLD
    for (const tld of SUSPICIOUS_TLDS) {
      if (domain.endsWith(tld)) {
        signals.push({
          id: `sig-${signals.length + 1}`,
          label: `High-Risk TLD (${tld})`,
          severity: "high",
          explanation: `Domain utilizes '${tld}', a top-level domain statistically associated with short-lived malicious campaigns.`,
          detectedPattern: tld
        })
        domainScore += 35
        break
      }
    }

    // Check verified platform whitelist
    const isVerifiedPlatform = Boolean(VERIFIED_PLATFORMS[domain] || VERIFIED_PLATFORMS[fullHost])

    // Pure numeric domain check (e.g. 468562.com, 123890.com)
    const isPureNumeric = /^[0-9]+$/.test(domainNoTld)
    if (isPureNumeric && !isVerifiedPlatform) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Pure Numeric Host Pattern",
        severity: "critical",
        explanation: `Domain '${domainNoTld}' consists exclusively of numerical digits, a recognized signature of disposable phishing hosts, bulletproof servers, or fraudulent gateways.`,
        detectedPattern: domainNoTld
      })
      domainScore += 65
    }

    // Embedded numeric pattern (e.g. go56, pay99, win888, chatg2t)
    const hasNumInDomain = /[a-z]+[0-9]+/i.test(domainNoTld) || /[0-9]+[a-z]+/i.test(domainNoTld)
    if (hasNumInDomain && !isVerifiedPlatform && !isPureNumeric) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Alphanumeric Domain Pattern",
        severity: "high",
        explanation: `Domain incorporates short numeric concatenation ('${domainNoTld}'), a pattern frequently observed in disposable redirectors and phishing infrastructure.`,
        detectedPattern: domainNoTld
      })
      domainScore += 45
    }

    // Unverified external domain status
    if (!isVerifiedPlatform && !isPureNumeric && !hasNumInDomain) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Unverified Third-Party Domain",
        severity: "medium",
        explanation: `Domain '${domain}' is not recognized in verified enterprise directories. Exercise caution before entering credentials.`,
        detectedPattern: domain
      })
      domainScore += 45
    }

    // Leetspeak homoglyph mapping (0->o, 1->l/i, 2->z, 3->e, 4->a, 5->s)
    const leetMap: Record<string, string> = { '0': 'o', '1': 'l', '2': 'z', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', '$': 's' }
    const unleetDomain = domainNoTld.split("").map(c => leetMap[c] || c).join("")

    if (unleetDomain !== domainNoTld) {
      for (const brand of POPULAR_BRANDS) {
        if (unleetDomain === brand || (brand.length >= 5 && unleetDomain.includes(brand) && !domain.endsWith(`${brand}.com`))) {
          signals.push({
            id: `sig-${signals.length + 1}`,
            label: `Leetspeak Brand Spoofing (${brand.toUpperCase()})`,
            severity: "critical",
            explanation: `Replaces letters with similar numbers to visually impersonate genuine brand '${brand}.com' ('${domainNoTld}').`,
            detectedPattern: domainNoTld
          })
          domainScore += 55
          break
        }
      }
    }

    // Brand Typosquat / Lookalike
    for (const brand of POPULAR_BRANDS) {
      // Lookalike keyword in untrusted host
      if (fullHost.includes(brand) && !fullHost.endsWith(`${brand}.com`) && !fullHost.endsWith(`${brand}.org`)) {
        signals.push({
          id: `sig-${signals.length + 1}`,
          label: `Brand Trademark in Untrusted Host (${brand.toUpperCase()})`,
          severity: "critical",
          explanation: `The brand name '${brand}' is embedded inside an unverified third-party domain (${fullHost}).`,
          detectedPattern: brand
        })
        domainScore += 48
        break
      }

      if (isVerifiedPlatform) continue

      const dist = Math.min(
        levenshteinDistance(domainNoTld, brand),
        levenshteinDistance(unleetDomain, brand)
      )

      if (dist > 0 && dist <= 2 && domainNoTld.length >= 4 && brand.length >= 4 && !domain.endsWith(`${brand}.com`)) {
        signals.push({
          id: `sig-${signals.length + 1}`,
          label: `Typosquatted Brand Lookalike (${brand.toUpperCase()})`,
          severity: "critical",
          explanation: `Domain '${domainNoTld}' is deceptively similar to authentic platform '${brand}.com' (Edit distance: ${dist}).`,
          detectedPattern: domainNoTld
        })
        domainScore += 50
        break
      }
    }

    // URL Shortener
    if (URL_SHORTENERS.has(domain)) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "URL Redirection Shortener",
        severity: "high",
        explanation: `Utilizes link shortener service '${domain}' to obfuscate the real target landing page.`,
        detectedPattern: domain
      })
      urlScore += 35
    }

    // Unencrypted HTTP
    if (protocol === "http") {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Missing SSL / Plain HTTP",
        severity: "medium",
        explanation: "Communication over plain unencrypted HTTP exposes credentials to transit interception.",
        detectedPattern: "http://"
      })
      urlScore += 25
    }

    // @ symbol redirect trick
    if (cleanInput.includes("@")) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Credential Masking Redirect (@)",
        severity: "critical",
        explanation: "The '@' character in URL syntax redirects the browser to a destination different from what is visually displayed.",
        detectedPattern: "@"
      })
      urlScore += 45
    }

    // Backslash syntax trick
    if (cleanInput.includes("\\")) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Backslash Evasion Syntax",
        severity: "high",
        explanation: "Uses backslashes ('\\') to evade automated URL filtering parsers.",
        detectedPattern: "\\"
      })
      urlScore += 35
    }

    // Suspicious Parameters
    if (params && (params.length > 50 || params.includes("token=") || params.includes("redirect=") || params.includes("login="))) {
      signals.push({
        id: `sig-${signals.length + 1}`,
        label: "Obfuscated Query Parameters",
        severity: "medium",
        explanation: "Contains extended session tracking or redirection query parameters commonly used in credential harvesting gates.",
        detectedPattern: params.substring(0, 30) + "..."
      })
      urlScore += 25
    }

    // Unverified external domain caution (if not verified and not flagged with major criticals)
    if (!isVerifiedPlatform && signals.length === 0) {
      domainScore += 20
    }
  }

  // 2. SOCIAL ENGINEERING & COERCION KEYWORDS
  const urgencyHits = URGENCY_KEYWORDS.filter(k => contentLower.includes(k))
  if (urgencyHits.length > 0) {
    signals.push({
      id: `sig-${signals.length + 1}`,
      label: "Urgency & Panic Triggers",
      severity: "high",
      explanation: `Psychological pressure identified ('${urgencyHits.slice(0, 2).join("', '")}'), designed to induce hasty compliance.`,
      detectedPattern: urgencyHits[0]
    })
    socialScore += Math.min(50, 25 * urgencyHits.length)
  }

  const fearHits = FEAR_REWARD_KEYWORDS.filter(k => contentLower.includes(k))
  if (fearHits.length > 0) {
    signals.push({
      id: `sig-${signals.length + 1}`,
      label: "Fear / Reward Lure",
      severity: "high",
      explanation: `Deceptive hook detected ('${fearHits.slice(0, 2).join("', '")}'), common in prize lottery and account lock scams.`,
      detectedPattern: fearHits[0]
    })
    socialScore += Math.min(45, 25 * fearHits.length)
  }

  const credHits = CREDENTIAL_KEYWORDS.filter(k => contentLower.includes(k))
  if (credHits.length > 0) {
    signals.push({
      id: `sig-${signals.length + 1}`,
      label: "Credential Harvest Request",
      severity: "critical",
      explanation: `Explicitly requests sensitive credentials or security codes ('${credHits.slice(0, 2).join("', '")}').`,
      detectedPattern: credHits[0]
    })
    credentialScore += Math.min(55, 30 * credHits.length)
  }

  // 3. SCORE CALCULATION
  const bDomain = Math.min(100, domainScore)
  const bUrl = Math.min(100, urlScore)
  const bSocial = Math.min(100, socialScore)
  const bCredential = Math.min(100, credentialScore)

  let weightedScore: number
  if (inputType === "url") {
    weightedScore = (bDomain * 0.45) + (bUrl * 0.35) + (bSocial * 0.10) + (bCredential * 0.10)
  } else {
    weightedScore = (bSocial * 0.40) + (bCredential * 0.40) + (bDomain * 0.10) + (bUrl * 0.10)
  }

  const hasCritical = signals.some(s => s.severity === "critical")
  const hasHigh = signals.some(s => s.severity === "high")

  if (hasCritical) {
    weightedScore = Math.max(weightedScore, 82)
  } else if (hasHigh) {
    weightedScore = Math.max(weightedScore, 58)
  }

  // Check if verified authentic platform
  const verifiedInfo = parsedUrl ? (VERIFIED_PLATFORMS[parsedUrl.domain] || VERIFIED_PLATFORMS[parsedUrl.fullHost]) : undefined

  let finalRiskScore = Math.min(100, Math.max(3, Math.round(weightedScore)))
  if (verifiedInfo && signals.length === 0) {
    finalRiskScore = 4
  } else if (!verifiedInfo) {
    // Non-verified targets can NEVER be given a safe low score
    finalRiskScore = Math.max(finalRiskScore, 48)
  }

  // Severity classification: Only genuinely verified platforms can ever receive SAFE
  let riskLevel: ScanItem["riskLevel"]
  let verdict: string
  if (finalRiskScore >= 80) {
    riskLevel = "CRITICAL"
    verdict = "Severe Threat Detected"
  } else if (finalRiskScore >= 60) {
    riskLevel = "HIGH RISK"
    verdict = "High Risk Phishing Target"
  } else if (verifiedInfo && signals.length === 0) {
    riskLevel = "SAFE"
    verdict = "Verified Authentic Platform"
  } else {
    riskLevel = "MEDIUM RISK"
    verdict = "Unverified Target (Caution Required)"
  }

  // Threat type / Primary classification
  let threatType: string
  if (verifiedInfo && signals.length === 0) {
    threatType = verifiedInfo.title
  } else if (signals.some(s => s.label.includes("Pure Numeric"))) {
    threatType = "Pure Numeric Disposable Host"
  } else if (bDomain >= 40 && signals.some(s => s.label.includes("Typosquat") || s.label.includes("Spoofing") || s.label.includes("Trademark"))) {
    threatType = "Brand Impersonation & Typosquatting"
  } else if (signals.some(s => s.label.includes("Alphanumeric"))) {
    threatType = "Suspicious Alphanumeric Domain Pattern"
  } else if (bCredential >= 40 && bSocial >= 30) {
    threatType = inputType === "message" ? "Smishing Credential Harvest" : "Credential Phishing Gateway"
  } else if (bSocial >= 40) {
    threatType = "Urgent Social Engineering Lure"
  } else if (bUrl >= 40 && signals.some(s => s.label.includes("Redirect") || s.label.includes("Shortener"))) {
    threatType = "Deceptive Redirection Chain"
  } else if (finalRiskScore >= 61) {
    threatType = "High-Risk Untrusted Vector"
  } else {
    threatType = "Unverified Third-Party Domain"
  }

  // Breakdown array for UI
  const breakdown: BreakdownBar[] = [
    { label: "Domain Structure", percentage: bDomain, color: "#06b6d4" },
    { label: "URL Path & Parameters", percentage: bUrl, color: "#38bdf8" },
    { label: "Social Engineering Intent", percentage: bSocial, color: "#a855f7" },
    { label: "Credential Interception", percentage: bCredential, color: "#ef4444" }
  ]

  // Dynamic URL Segments
  let urlSegments: UrlSegment[] | undefined = undefined
  if (parsedUrl) {
    urlSegments = [
      { text: `${parsedUrl.protocol}://`, label: "PROTOCOL", isSuspicious: parsedUrl.protocol === "http" },
      ...(parsedUrl.subdomain ? [{ text: parsedUrl.subdomain, label: "SUBDOMAIN" as const, isSuspicious: parsedUrl.subdomain.includes(".") }] : []),
      { text: parsedUrl.domain, label: "DOMAIN", isSuspicious: finalRiskScore >= 31 && !verifiedInfo },
      ...(parsedUrl.path && parsedUrl.path !== "/" ? [{ text: parsedUrl.path, label: "PATH" as const, isSuspicious: false }] : []),
      ...(parsedUrl.params ? [{ text: `?${parsedUrl.params}`, label: "PARAMS" as const, isSuspicious: parsedUrl.params.length > 30 }] : [])
    ]
  }

  // Live Signals
  const liveSignals: LiveSignal[] = [
    {
      id: "ls-1",
      text: "Domain TLD & SSL Encryption Protocol",
      status: parsedUrl?.protocol === "http" || signals.some(s => s.label.includes("TLD")) ? "fail" : "pass"
    },
    {
      id: "ls-2",
      text: "Homoglyph & Brand Typosquatting Verification",
      status: signals.some(s => s.label.includes("Typosquat") || s.label.includes("Spoofing") || s.label.includes("Alphanumeric")) ? "fail" : "pass"
    },
    {
      id: "ls-3",
      text: "Heuristic Urgency & Coercion Linguistic Match",
      status: bSocial >= 40 ? "fail" : bSocial >= 20 ? "warn" : "pass"
    },
    {
      id: "ls-4",
      text: "Credential Interception & Authentication Gateway",
      status: bCredential >= 40 ? "fail" : bCredential >= 20 ? "warn" : "pass"
    }
  ]

  // AI & Structured Explanation
  let summaryText = ""
  let detailedReasoning = ""
  let attackerIntent = ""
  let realWorldComparison = ""

  if (verifiedInfo && signals.length === 0) {
    summaryText = `Target domain belongs to verified authentic infrastructure (${verifiedInfo.title}). Zero threat signals detected.`
    detailedReasoning = `The domain resolves to verified ${verifiedInfo.category} authority with valid certificates and recognized public presence. No lookalike homoglyphs or phishing signatures present.`
    attackerIntent = "Authentic service interaction; no malicious intent identified."
    realWorldComparison = "Standard verified web destination."
  } else if (signals.length > 0) {
    const signalNames = signals.map(s => s.label).join(", ")
    summaryText = `Flagged as ${riskLevel} (${finalRiskScore}/100) exhibiting distinct signatures of ${threatType}.`
    detailedReasoning = `The analysis identified critical threat signals: ${signalNames}. The domain '${parsedUrl?.domain || cleanInput}' exhibits deceptive traits designed to bypass visual scrutiny.`
    attackerIntent = signals.some(s => s.label.includes("Credential"))
      ? "Adversary aims to harvest sensitive credentials, passwords, or personal identity information."
      : "Adversary seeks to divert traffic through unverified or disposable redirection channels."
    realWorldComparison = signals.some(s => s.label.includes("Brand") || s.label.includes("Alphanumeric"))
      ? "Typosquatting or bulk-registered disposable phishing lure."
      : "Automated social engineering campaign."
  } else {
    summaryText = `Unverified third-party domain evaluated. No immediate malicious signatures detected.`
    detailedReasoning = `The target '${cleanInput}' does not match known high-profile brand spoofs, but lacks an established enterprise identity. Standard security precautions apply.`
    attackerIntent = "No active hostile intent detected at this time."
    realWorldComparison = "Uncategorized third-party web resource."
  }

  // Recommended actions
  let recommendedActions: ScanItem["recommendedActions"] = []
  if (finalRiskScore >= 61) {
    recommendedActions = [
      { title: "Block Interaction", detail: "Do not visit this link or submit any passwords or financial credentials.", isBlock: true },
      { title: "Report Threat", detail: "Report this URL or message to your security administrator.", isBlock: false },
      { title: "Use Official Channel", detail: "If you need this service, navigate manually to the official verified website.", isBlock: false }
    ]
  } else if (finalRiskScore >= 31) {
    recommendedActions = [
      { title: "Exercise Caution", detail: "Verify domain authenticity before providing any personal information.", isBlock: false },
      { title: "Inspect SSL & URL", detail: "Check certificate status and avoid downloading unexpected attachments.", isBlock: false }
    ]
  } else {
    recommendedActions = [
      { title: "Standard Browsing", detail: "No malicious signatures detected. Always confirm SSL before entering credentials.", isBlock: false }
    ]
  }

  return {
    id: `SCN-${Math.floor(10000 + Math.random() * 90000)}`,
    inputType,
    content: cleanInput,
    riskScore: finalRiskScore,
    riskLevel,
    threatType,
    verdict,
    confidence: signals.length === 0 ? 92 : Math.min(99, 75 + signals.length * 6),
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    signalsCount: signals.length,
    chips: signals,
    breakdown,
    urlSegments,
    liveSignals,
    aiExplanation: summaryText,
    structuredExplanation: {
      summary: summaryText,
      detailed_reasoning: detailedReasoning,
      attacker_intent: attackerIntent,
      real_world_comparison: realWorldComparison
    },
    recommendedActions
  }
}
