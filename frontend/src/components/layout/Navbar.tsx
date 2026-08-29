import { useState } from "react"
import { Shield, Scan, History, FileText, Menu, X, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/lightswind/badge"
import { Avatar, AvatarFallback } from "@/components/lightswind/avatar"

interface NavbarProps {
  activePage: string
  onNavigate: (page: string) => void
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "scanner", label: "Scanner", icon: Scan },
    { id: "how-it-works", label: "How It Works", icon: HelpCircle },
    { id: "history", label: "History", icon: History },
    { id: "reports", label: "Reports", icon: FileText },
  ]

  const handleNavClick = (id: string) => {
    onNavigate(id)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 cyber-glass backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Branding */}
        <div 
          onClick={() => handleNavClick("scanner")}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-90 min-h-[44px]"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
            <Shield className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-wider text-slate-100 uppercase font-mono">PhishGuard</span>
            <span className="hidden xs:inline-flex rounded-lg bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyan-400 border border-cyan-500/25">
              Threat Intelligence
            </span>
          </div>
        </div>

        {/* Center Navigation: Aceternity / Magic UI Animated Sliding Pill Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 font-mono text-xs p-1 rounded-2xl bg-slate-950/60 border border-slate-800/60 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activePage === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 min-h-[40px] transition-colors cursor-pointer select-none ${
                  isActive ? "text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-xl bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Right Status Indicator & Avatar */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center">
            <Badge variant="success" size="sm" className="font-mono text-[10px] px-3 py-1">
              ENGINE ONLINE
            </Badge>
          </div>

          <div className="hidden sm:flex items-center cursor-pointer min-h-[44px] min-w-[44px]">
            <Avatar className="h-9 w-9 border border-cyan-500/30 bg-slate-900/90 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:border-cyan-400 transition-all">
              <AvatarFallback className="bg-slate-900 text-cyan-300 font-mono text-xs font-bold">
                PG
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-cyan-400 transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 font-mono animate-in slide-in-from-top duration-300 shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs text-slate-400">
            <span>NAVIGATION</span>
            <Badge variant="success" size="sm" className="text-[10px]">
              ONLINE
            </Badge>
          </div>

          <div className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                      : "text-slate-300 hover:bg-slate-900/80 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </header>
  )
}
