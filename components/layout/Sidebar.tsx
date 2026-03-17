'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ROUTES } from '@/lib/constants/routes'
import { useUIStore } from '@/lib/store/useUIStore'

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, mobileOpen, closeMobile } = useUIStore()

  const sections = NAV_ROUTES.reduce<Record<string, typeof NAV_ROUTES>>((acc, r) => {
    if (!acc[r.section]) acc[r.section] = []
    acc[r.section].push(r)
    return acc
  }, {})

  return (
    <aside
      className={`
        sidebar flex flex-col bg-bg-2 border-r border-border z-50 transition-all duration-250 flex-shrink-0
        fixed inset-y-0 left-0
        lg:relative lg:inset-y-auto lg:left-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${sidebarCollapsed ? 'w-14' : 'w-64 lg:w-56'}
      `}
    >
      {/* Top / Brand */}
      <div className={`border-b border-border ${sidebarCollapsed ? 'p-3' : 'p-4 pb-4'}`}>
        <div className={`flex items-center gap-2 mb-2 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br from-teal to-[#0899c0] shadow-teal-glow">
              🏗
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="font-head text-xl font-black tracking-[1.5px] leading-none text-text">P-SKE</div>
                <div className="text-[9px] text-text-3 tracking-[2px] uppercase font-head mt-0.5">Intelligence Hub</div>
              </div>
            )}
          </div>
          {/* Close button — mobile only */}
          {!sidebarCollapsed && (
            <button
              onClick={closeMobile}
              className="lg:hidden w-7 h-7 flex items-center justify-center text-text-3 hover:text-text transition-colors"
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="inline-flex items-center gap-1.5 bg-teal/[0.07] border border-teal/[0.18] text-teal font-mono text-[9px] px-2 py-1 rounded-[3px]">
            <span className="w-1.5 h-1.5 bg-teal rounded-full animate-pulse-teal" />
            LIVE · Jun 23 2025
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-none">
        {Object.entries(sections).map(([section, routes]) => (
          <div key={section}>
            {!sidebarCollapsed && (
              <div className="font-head text-[9px] tracking-[2.5px] uppercase text-text-3 px-2 mt-3.5 mb-1">
                {section}
              </div>
            )}
            {routes.map((route) => {
              const isActive = pathname === route.href || pathname?.startsWith(route.href + '/')
              return (
                <Link
                  key={route.id}
                  href={route.href}
                  title={route.label}
                  onClick={closeMobile}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-150 text-[13px] font-medium border mb-px relative
                    ${isActive
                      ? 'bg-teal/[0.07] border-teal/20 text-teal'
                      : 'border-transparent text-text-2 hover:bg-white/[0.04] hover:text-text'
                    }
                    ${sidebarCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-[-8px] top-1/4 bottom-1/4 w-0.5 bg-teal rounded-r-sm" />
                  )}
                  <span className="text-[15px] w-5 text-center flex-shrink-0">{route.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-body">{route.label}</span>
                      {route.badge && (
                        <span className="ml-auto font-mono text-[9px] bg-surface px-1 rounded-[3px] text-text-3">{route.badge}</span>
                      )}
                      {route.alert && (
                        <span className="ml-auto font-mono text-[9px] bg-red/15 text-red px-1 rounded-[3px]">{route.alert}</span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-3 text-[10px] text-text-3">
        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:block w-full bg-transparent border-none text-text-3 cursor-pointer p-1.5 text-sm hover:text-text transition-colors"
          title="Toggle sidebar"
        >
          ⇔
        </button>
        {!sidebarCollapsed && (
          <div className="mt-1.5">
            <div className="font-mono text-text-2 mb-0.5">W25 · Q2 2025</div>
            <div>Refresh: 06:00 AM</div>
          </div>
        )}
      </div>
    </aside>
  )
}
