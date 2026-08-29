import { type ScanItem, type ThreatChip, type UrlSegment, type LiveSignal } from "@/data/mockData"

const API_BASE = "http://127.0.0.1:5000"

export function mapBackendToScanItem(data: any): ScanItem {
  const riskScore = data.risk_score ?? 50
  const riskLevel =
    riskScore >= 86
      ? "CRITICAL"
      : riskScore >= 61
      ? "HIGH RISK"
      : riskScore >= 31
      ? "MEDIUM RISK"
      : "SAFE"

  const chips: ThreatChip[] = (data.signals || []).map((s: any, idx: number) => ({
    id: `chip-${idx}`,
    label: s.label || "Suspicious Signal",
    severity: (s.severity || "high").toLowerCase(),
    explanation: s.detail || "Flagged by heuristic detector.",
    detectedPattern: s.label || "Heuristic pattern"
  }))

  const breakdown = [
    {
      label: "Domain Structure",
      percentage: data.breakdown?.domain_structure ?? 0,
      color: "#06b6d4"
    },
    {
      label: "URL Path & Parameters",
      percentage: data.breakdown?.url_pattern ?? 0,
      color: "#38bdf8"
    },
    {
      label: "Social Engineering Intent",
      percentage: data.breakdown?.social_engineering ?? 0,
      color: "#a855f7"
    },
    {
      label: "Credential Interception",
      percentage: data.breakdown?.credential_request ?? 0,
      color: "#ef4444"
    }
  ]

  let urlSegments: UrlSegment[] | undefined = undefined
  if (data.url_segments) {
    const seg = data.url_segments
    urlSegments = [
      { text: `${seg.protocol}://`, label: "PROTOCOL", isSuspicious: seg.protocol === "http" },
      ...(seg.subdomain ? [{ text: seg.subdomain, label: "SUBDOMAIN" as const, isSuspicious: seg.subdomain.includes(".") }] : []),
      { text: seg.domain || "", label: "DOMAIN", isSuspicious: riskScore >= 61 },
      ...(seg.path && seg.path !== "/" ? [{ text: seg.path, label: "PATH" as const, isSuspicious: false }] : []),
      ...(seg.params ? [{ text: `?${seg.params}`, label: "PARAMS" as const, isSuspicious: seg.params.length > 30 }] : [])
    ]
  }

  const liveSignals: LiveSignal[] = [
    { id: "sig-1", text: "Verifying Domain TLD & SSL Encryption", status: data.breakdown?.domain_structure > 30 ? "fail" : "pass" },
    { id: "sig-2", text: "Scanning Typosquat & Homoglyph Lookalikes", status: chips.some(c => c.label.includes("Typosquat") || c.label.includes("Substitution")) ? "fail" : "pass" },
    { id: "sig-3", text: "Analyzing Urgency & Psychological Coercion", status: data.breakdown?.social_engineering > 30 ? "warn" : "pass" },
    { id: "sig-4", text: "Checking Credential Harvesting Hooks", status: data.breakdown?.credential_request > 30 ? "fail" : "pass" }
  ]

  const recommendedActions = (data.recommended_action || [
    "Do not click this link or submit personal data.",
    "Report this suspicious content to your security team."
  ]).map((act: string, idx: number) => ({
    title: idx === 0 ? "Block Interaction" : idx === 1 ? "Verify Channel" : "Report Incident",
    detail: act,
    isBlock: idx === 0
  }))

  return {
    id: data.id ? data.id.substring(0, 9).toUpperCase() : `SCN-${Math.floor(10000 + Math.random() * 90000)}`,
    inputType: data.input_type || "url",
    content: data.content || "",
    riskScore: riskScore,
    riskLevel: riskLevel,
    threatType: data.classification_title || "Phishing Vector Analysis",
    confidence: data.confidence ?? 94,
    timestamp: (data.timestamp || new Date().toISOString()).replace("T", " ").substring(0, 19),
    signalsCount: chips.length,
    chips: chips,
    breakdown: breakdown,
    urlSegments: urlSegments,
    liveSignals: liveSignals,
    aiExplanation:
      typeof data.ai_explanation === "object" && data.ai_explanation !== null
        ? data.ai_explanation.summary || ""
        : typeof data.ai_explanation === "string"
        ? data.ai_explanation
        : "Target content analyzed against heuristic domain telemetry and NLP models.",
    structuredExplanation:
      typeof data.ai_explanation === "object" && data.ai_explanation !== null
        ? {
            summary: data.ai_explanation.summary || "",
            detailed_reasoning: data.ai_explanation.detailed_reasoning || "",
            attacker_intent: data.ai_explanation.attacker_intent || "",
            real_world_comparison: data.ai_explanation.real_world_comparison || ""
          }
        : undefined,
    recommendedActions: recommendedActions
  }
}

export async function analyzeThreatAPI(type: "url" | "message", content: string): Promise<ScanItem> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content })
  })

  if (!response.ok) {
    throw new Error(`Analysis failed with status ${response.status}`)
  }

  const json = await response.json()
  return mapBackendToScanItem(json)
}

export async function fetchHistoryAPI(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/api/history`)
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}
