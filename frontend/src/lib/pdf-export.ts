import { jsPDF } from "jspdf"
import { type ScanItem } from "@/data/mockData"

export async function exportReportPDF(scan: ScanItem): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
      // Draw top header band on new page
      doc.setFillColor(15, 23, 42) // slate-900
      doc.rect(margin, y, contentWidth, 8, "F")
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(6, 182, 212)
      doc.text(`PHISHGUARD AUDIT REPORT • #${scan.id}`, margin + 3, y + 5.5)
      y += 14
    }
  }

  // -------------------------------------------------------------
  // 1. TOP HEADER BRANDING BANNER
  // -------------------------------------------------------------
  doc.setFillColor(5, 7, 12) // #05070c dark background
  doc.rect(margin, y, contentWidth, 24, "F")

  // Cyan accent line
  doc.setFillColor(6, 182, 212) // #06b6d4
  doc.rect(margin, y, contentWidth, 1.5, "F")

  // Logo & Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text("PHISHGUARD", margin + 6, y + 11)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(6, 182, 212)
  doc.text("THREAT INTELLIGENCE & FORENSIC AUDIT", margin + 6, y + 17)

  // Report Date & ID (Right aligned)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  doc.text(`AUDIT ID: #${scan.id}`, pageWidth - margin - 6, y + 10, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text(`DATE: ${scan.timestamp}`, pageWidth - margin - 6, y + 16, { align: "right" })

  y += 30

  // -------------------------------------------------------------
  // 2. TARGET SUMMARY CARD
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249) // light slate container for contrast in print
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "F")
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, "D")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text(`ANALYZED ${scan.inputType.toUpperCase()}:`, margin + 4, y + 6)

  doc.setFont("courier", "normal")
  doc.setFontSize(8)
  doc.setTextColor(30, 41, 59)
  const targetLines = doc.splitTextToSize(scan.content, contentWidth - 8)
  doc.text(targetLines[0] || "", margin + 4, y + 11)

  y += 22

  // -------------------------------------------------------------
  // 3. THREAT VERDICT & SCORE METRICS
  // -------------------------------------------------------------
  const verdictCardHeight = 32
  doc.setFillColor(15, 23, 42) // dark slate card
  doc.roundedRect(margin, y, contentWidth, verdictCardHeight, 2, 2, "F")

  // Severity color indicator
  let sevR = 16, sevG = 185, sevB = 129 // green
  if (scan.riskScore >= 80) {
    sevR = 239; sevG = 68; sevB = 68 // red
  } else if (scan.riskScore >= 60) {
    sevR = 249; sevG = 115; sevB = 22 // orange
  } else if (scan.riskScore >= 40) {
    sevR = 245; sevG = 158; sevB = 11 // amber
  }

  // Left Score Badge
  doc.setFillColor(sevR, sevG, sevB)
  doc.roundedRect(margin + 5, y + 5, 28, 22, 2, 2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text(`${scan.riskScore}`, margin + 19, y + 16, { align: "center" })

  doc.setFontSize(6.5)
  doc.text("OUT OF 100", margin + 19, y + 21, { align: "center" })

  // Right Verdict Details
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(6, 182, 212)
  doc.text("PRIMARY CLASSIFICATION", margin + 38, y + 10)

  doc.setFontSize(12)
  doc.setTextColor(255, 255, 255)
  doc.text(scan.threatType, margin + 38, y + 17)

  doc.setFontSize(8)
  doc.setTextColor(203, 213, 225)
  doc.text(`VERDICT: ${scan.riskLevel}   •   CONFIDENCE: ${scan.confidence}%   •   SIGNALS: ${scan.chips.length}`, margin + 38, y + 24)

  y += verdictCardHeight + 8

  // -------------------------------------------------------------
  // 4. THREAT SIGNALS IDENTIFIED
  // -------------------------------------------------------------
  checkPageBreak(30)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text("IDENTIFIED THREAT SIGNALS", margin, y)
  y += 5

  if (scan.chips.length === 0) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9)
    doc.setTextColor(16, 185, 129)
    doc.text("✓ Zero malicious signals detected. Content passed baseline heuristic validation.", margin + 4, y + 4)
    y += 10
  } else {
    for (const chip of scan.chips) {
      checkPageBreak(16)

      doc.setFillColor(248, 250, 252)
      doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "F")
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "D")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8.5)
      doc.setTextColor(185, 28, 28) // red text for threat
      doc.text(`• ${chip.label}`, margin + 4, y + 5)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.setTextColor(71, 85, 105)
      const detailLines = doc.splitTextToSize(chip.explanation, contentWidth - 8)
      doc.text(detailLines[0] || "", margin + 4, y + 9.5)

      y += 15
    }
  }

  y += 3

  // -------------------------------------------------------------
  // 5. AI SECURITY ANALYST INSIGHT
  // -------------------------------------------------------------
  if (scan.structuredExplanation || scan.aiExplanation) {
    checkPageBreak(36)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text("AI SECURITY ANALYST SYNTHESIS", margin, y)
    y += 5

    if (scan.structuredExplanation) {
      const se = scan.structuredExplanation
      doc.setFillColor(243, 232, 255)
      doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, "F")
      doc.setDrawColor(216, 180, 254)
      doc.roundedRect(margin, y, contentWidth, 32, 1.5, 1.5, "D")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(107, 33, 168)
      doc.text("EXECUTIVE SUMMARY:", margin + 4, y + 4.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 41, 59)
      const sumLines = doc.splitTextToSize(se.summary, contentWidth - 8)
      doc.text(sumLines.slice(0, 2), margin + 4, y + 8)

      doc.setFont("helvetica", "bold")
      doc.setTextColor(107, 33, 168)
      doc.text("TECHNICAL FORENSICS:", margin + 4, y + 17)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 41, 59)
      const forensLines = doc.splitTextToSize(se.detailed_reasoning, contentWidth - 8)
      doc.text(forensLines.slice(0, 2), margin + 4, y + 20.5)

      doc.setFont("helvetica", "bold")
      doc.setTextColor(107, 33, 168)
      doc.text(`ATTACKER OBJECTIVE: `, margin + 4, y + 29)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(30, 41, 59)
      const intentLines = doc.splitTextToSize(se.attacker_intent, contentWidth - 42)
      doc.text(intentLines[0] || "", margin + 40, y + 29)

      y += 38
    } else {
      doc.setFillColor(243, 232, 255)
      doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "F")
      doc.setDrawColor(216, 180, 254)
      doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, "D")

      doc.setFont("helvetica", "normal")
      doc.setFontSize(8)
      doc.setTextColor(59, 7, 100)
      const aiLines = doc.splitTextToSize(scan.aiExplanation, contentWidth - 8)
      doc.text(aiLines.slice(0, 3), margin + 4, y + 5.5)

      y += 24
    }
  }

  // -------------------------------------------------------------
  // 6. RECOMMENDED ACTIONS
  // -------------------------------------------------------------
  if (scan.recommendedActions && scan.recommendedActions.length > 0) {
    checkPageBreak(35)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.text("INCIDENT RESPONSE & RECOMMENDED ACTIONS", margin, y)
    y += 5

    for (const act of scan.recommendedActions) {
      checkPageBreak(12)

      doc.setFillColor(254, 242, 242)
      doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "F")
      doc.setDrawColor(254, 202, 202)
      doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "D")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(153, 27, 27)
      doc.text(`[!] ${act.title}:`, margin + 4, y + 4.5)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.setTextColor(69, 10, 10)
      const actLines = doc.splitTextToSize(act.detail, contentWidth - 40)
      doc.text(actLines[0] || "", margin + 35, y + 4.5)

      y += 12
    }
  }

  // -------------------------------------------------------------
  // 7. FOOTER ON ALL PAGES
  // -------------------------------------------------------------
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
      "CONFIDENTIAL • PhishGuard AI Threat Analysis Engine • For Incident Response & Security Triage",
      margin,
      pageHeight - 8
    )
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" })
  }

  // Trigger real browser download
  const cleanId = scan.id.replace(/[^a-zA-Z0-9_-]/g, "")
  doc.save(`PhishGuard-Report-${cleanId}.pdf`)
}
