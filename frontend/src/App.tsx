import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { ScannerPage } from "@/components/pages/ScannerPage"
import { HowItWorksPage } from "@/components/pages/HowItWorksPage"
import { ScanHistoryPage } from "@/components/pages/ScanHistoryPage"
import { AnalysisReportPage } from "@/components/pages/AnalysisReportPage"
import { SpotlightBackground } from "@/components/ui/spotlight-background"
import { MOCK_SCANS, type ScanItem } from "@/data/mockData"

export function App() {
  const [currentPage, setCurrentPage] = useState<string>("scanner")
  const [selectedScan, setSelectedScan] = useState<ScanItem>(MOCK_SCANS[0])

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleScanComplete = (result: ScanItem) => {
    MOCK_SCANS.unshift(result)
    setSelectedScan(result)
  }

  return (
    <div className="relative min-h-screen bg-[#05070c] text-slate-100 dark selection:bg-cyan-500 selection:text-slate-950 font-sans overflow-x-hidden w-full max-w-full">
      {/* Aceternity UI Parallax Ambient Glow, Sparkles & Grid */}
      <SpotlightBackground />

      {/* Top Header Navbar */}
      <Navbar
        activePage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Content View Container with Framer Motion AnimatePresence */}
      <main className="relative z-10 pt-6 sm:pt-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {currentPage === "scanner" && (
              <ScannerPage
                activeScan={selectedScan}
                onScanComplete={handleScanComplete}
              />
            )}

            {currentPage === "how-it-works" && (
              <HowItWorksPage
                onNavigate={handleNavigate}
              />
            )}

            {currentPage === "history" && (
              <ScanHistoryPage
                onNavigate={handleNavigate}
                onSelectScan={(scan) => setSelectedScan(scan)}
              />
            )}

            {currentPage === "reports" && (
              <AnalysisReportPage
                scan={selectedScan}
                onNavigate={handleNavigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
