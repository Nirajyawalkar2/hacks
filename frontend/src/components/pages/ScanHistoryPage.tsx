import React, { useState, useEffect } from "react"
import { History, Search, Globe, MessageSquare, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { MOCK_SCANS, type ScanItem } from "@/data/mockData"
import { fetchHistoryAPI } from "@/services/api"
import { Badge } from "@/components/lightswind/badge"
import { Button } from "@/components/lightswind/button"
import { Input } from "@/components/lightswind/input"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/lightswind/table"
import { Card } from "@/components/ui/card"
import { CardSpotlight } from "@/components/ui/card-spotlight"

interface ScanHistoryPageProps {
  onSelectScan: (scan: ScanItem) => void
  onNavigate: (page: string) => void
}

export const ScanHistoryPage: React.FC<ScanHistoryPageProps> = ({ onSelectScan, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<"all" | "url" | "message">("all")
  const [scans, setScans] = useState<ScanItem[]>(MOCK_SCANS)

  useEffect(() => {
    fetchHistoryAPI().then((apiScans) => {
      if (Array.isArray(apiScans) && apiScans.length > 0) {
        const mapped: ScanItem[] = apiScans.map((s, idx) => ({
          id: s.id || `SCN-${idx}`,
          inputType: s.input_type || "url",
          content: s.content || "",
          riskScore: s.risk_score || 50,
          riskLevel: s.severity === "CRITICAL" ? "CRITICAL" : s.severity === "HIGH" ? "HIGH RISK" : s.severity === "MEDIUM" ? "MEDIUM RISK" : "SAFE",
          threatType: s.classification_title || "Phishing Vector",
          confidence: 94,
          timestamp: s.timestamp || "2026-08-29",
          signalsCount: s.risk_score >= 80 ? 3 : s.risk_score >= 50 ? 2 : 0,
          chips: [],
          breakdown: [],
          liveSignals: [],
          aiExplanation: "",
          recommendedActions: []
        }))
        setScans(mapped)
      }
    }).catch(() => {})
  }, [])

  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scan.content.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false
    if (typeFilter === "url" && scan.inputType !== "url") return false
    if (typeFilter === "message" && scan.inputType !== "message") return false

    return true
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 font-mono">
            <History className="h-7 w-7 text-cyan-400" />
            <span>Scan History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Audit logs of all scanned URLs, email payloads, and threat analysis verdicts.
          </p>
        </div>

        <Button
          onClick={() => onNavigate("scanner")}
          variant="glow"
          size="default"
          className="self-start sm:self-auto min-h-[44px]"
        >
          + New Scan
        </Button>
      </div>

      {/* Search & Filter (CardSpotlight) */}
      <CardSpotlight className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500 z-10" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scan ID or content..."
              className="pl-10"
            />
          </div>

          {/* Sliding Pill Filter Indicator */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/90 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
            {(["all", "url", "message"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`relative flex-1 sm:flex-none px-4 py-2 min-h-[38px] rounded-lg transition-colors cursor-pointer select-none ${
                  typeFilter === t ? "text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {typeFilter === t && (
                  <motion.div
                    layoutId="history-filter-pill"
                    className="absolute inset-0 rounded-lg bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">
                  {t === "all" ? "All Types" : t === "url" ? "URLs" : "Messages"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardSpotlight>

      {/* 1. Desktop History Table (Lightswind Table) */}
      <div className="hidden md:block">
        <Table hoverable={true}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">SCAN ID</TableHead>
              <TableHead className="w-[90px]">TYPE</TableHead>
              <TableHead className="min-w-[240px]">TARGET CONTENT</TableHead>
              <TableHead className="w-[100px] text-center">SCORE</TableHead>
              <TableHead className="w-[120px] text-center">VERDICT</TableHead>
              <TableHead className="w-[80px] text-center">SIGNALS</TableHead>
              <TableHead className="w-[60px] text-right">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500 font-sans">
                  No scan logs matching current query parameters.
                </TableCell>
              </TableRow>
            ) : (
              filteredScans.map((scan) => (
                <TableRow
                  key={scan.id}
                  onClick={() => {
                    onSelectScan(scan)
                    onNavigate("reports")
                  }}
                  className="cursor-pointer group"
                >
                  <TableCell className="font-bold text-cyan-400">
                    {scan.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm" withDot={false} className="gap-1 uppercase text-[10px]">
                      {scan.inputType === "url" ? <Globe className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                      {scan.inputType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-sans text-xs text-slate-300 max-w-[280px] truncate">
                    {scan.content}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={scan.riskScore >= 80 ? "destructive" : scan.riskScore >= 40 ? "warning" : "success"}
                      size="sm"
                    >
                      {scan.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    <span className={`text-[10px] ${scan.riskScore >= 80 ? "text-rose-400" : "text-emerald-400"}`}>
                      {scan.riskLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-slate-300 font-bold">
                    {scan.signalsCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[32px] p-2 group-hover:border-cyan-500/50 group-hover:text-cyan-400"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 2. Mobile Stacked Cards View with CardSpotlight */}
      <div className="md:hidden space-y-3 font-mono text-xs">
        {filteredScans.length === 0 ? (
          <Card className="p-6 text-center text-slate-500 font-sans">
            No scan logs matching current query parameters.
          </Card>
        ) : (
          filteredScans.map((scan) => (
            <CardSpotlight
              key={scan.id}
              onClick={() => {
                onSelectScan(scan)
                onNavigate("reports")
              }}
              className="p-4 space-y-3 cursor-pointer hover:border-cyan-500/40 transition-all active:scale-[0.99] border-slate-800/90"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm" withDot={false} className="gap-1 uppercase text-[10px]">
                    {scan.inputType === "url" ? <Globe className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                    {scan.inputType}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{scan.timestamp.split(" ")[0]}</span>
                </div>

                <Badge variant={scan.riskScore >= 80 ? "destructive" : "success"} size="sm">
                  Score: {scan.riskScore}
                </Badge>
              </div>

              <div className="text-xs text-slate-200 font-sans line-clamp-2 break-all">
                {scan.content}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className={`font-bold ${scan.riskScore >= 80 ? "text-rose-400" : "text-emerald-400"}`}>
                  {scan.riskLevel}
                </span>
                <div className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <span>View Report</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </CardSpotlight>
          ))
        )}
      </div>
    </div>
  )
}
