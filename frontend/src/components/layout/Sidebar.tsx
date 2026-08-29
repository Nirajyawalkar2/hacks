import React from "react"
import {
  LayoutDashboard,
  Scan,
  ShieldAlert,
  History,
  Settings,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  LineChart
} from "lucide-react"

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, onClose }) => {
  const overviewItems = [
    { id: "dashboard", label: "Command Center", icon: LayoutDashboard, shortcut: "⌘1" },
    { id: "scanner", label: "Threat Scanner", icon: Scan, badge: "AI", shortcut: "⌘2" },
    { id: "history", label: "Scan History", icon: History, count: "1,428", shortcut: "⌘3" },
  ]

  const intelligenceItems = [
    { id: "result", label: "Analysis Reports", icon: ShieldAlert },
    { id: "insights", label: "Threat Insights", icon: LineChart, badge: "Live" },
  ]

  const systemItems = [
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const authItems = [
    { id: "login", label: "Sign In", icon: LogIn },
    { id: "register", label: "Register Analyst", icon: UserPlus },
  ]

  const handleItemClick = (id: string) => {
    onNavigate(id)
    onClose()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-[#070a12]/95 backdrop-blur-md transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-6">
          {/* Group 1: OVERVIEW */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              Overview
            </div>
            <nav className="space-y-1">
              {overviewItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-mono font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-purple-300 border border-purple-500/30">
                          {item.badge}
                        </span>
                      )}
                      {item.shortcut && !item.badge && (
                        <kbd className="hidden sm:inline-block rounded bg-slate-900 px-1.5 py-0.5 text-[9px] text-slate-500 border border-slate-800">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-cyan-400" />}
                    </div>

                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Group 2: INTELLIGENCE */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              Intelligence
            </div>
            <nav className="space-y-1">
              {intelligenceItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-mono font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Group 3: SYSTEM */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              System
            </div>
            <nav className="space-y-1">
              {systemItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-mono font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Group 4: IDENTITY & ACCESS */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              Identity & Access
            </div>
            <nav className="space-y-1">
              {authItems.map((item) => {
                const Icon = item.icon
                const isActive = activePage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-mono font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                        : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Status Widget */}
        <div className="mt-4 rounded-xl border border-cyan-500/20 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Heuristic Engine</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
