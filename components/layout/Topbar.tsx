'use client'

import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { NAV_ROUTES } from '@/lib/constants/routes'
import { useProjectStore } from '@/lib/store/useProjectStore'
import { useUIStore } from '@/lib/store/useUIStore'

const PAGE_SUBTITLES: Record<string, string> = {
  '/gantt':       'Planned vs Actual Schedule',
  '/engineering': '12 Open Defects · Last Inspection Jun 20',
  '/field':       'Daily Field View',
  '/financial':   'Q2 2025 · Contract vs Actual',
  '/documents':   'Project Document Library',
  '/settings':    'Project Configuration',
  '/upload':      'Daily Excel Import',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function Topbar() {
  const pathname = usePathname()
  const { buildings, lastUploadDate } = useProjectStore()
  const { openMobile } = useUIStore()

  const { totalCost, avgPct, floryaCount, sharyCount } = useMemo(() => {
    const totalCost = buildings.reduce((s, b) => s + b.cost, 0)
    const avgPct    = buildings.length
      ? buildings.reduce((s, b) => s + b.pct, 0) / buildings.length
      : 0
    const floryaCount = buildings.filter(b => b.proj === 'Florya City').length
    const sharyCount  = buildings.filter(b => b.proj === 'Shary Daik').length
    return { totalCost, avgPct, floryaCount, sharyCount }
  }, [buildings])

  const route = NAV_ROUTES.find(r => pathname === r.href || pathname?.startsWith(r.href + '/'))
  const title = route?.label ?? 'Dashboard'

  let sub = PAGE_SUBTITLES[pathname ?? ''] ?? ''
  if (pathname === '/overview' || pathname === '/executive') {
    sub = `${buildings.length} Buildings · Florya ${floryaCount} · Shary ${sharyCount}`
  }
  if (pathname === '/sales') sub = `${buildings.length} Total Units`
  if (pathname === '/risk')  sub = '5 High-Priority Risks Active'

  return (
    <header className="topbar h-[52px] border-b border-border flex items-center px-4 md:px-6 gap-3 bg-bg-2 flex-shrink-0">

      {/* Hamburger — mobile only */}
      <button
        onClick={openMobile}
        className="lg:hidden w-8 h-8 bg-surface border border-border rounded-[5px] flex items-center justify-center text-text-2 hover:text-text transition-colors flex-shrink-0"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Title + subtitle */}
      <div className="min-w-0">
        <span className="font-head text-[16px] font-bold tracking-[0.3px] text-text">{title}</span>
        {sub && (
          <>
            <span className="hidden sm:inline text-text-3 mx-1 font-light"> / </span>
            <span className="hidden sm:inline text-[12px] text-text-2 truncate">{sub}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Portfolio value */}
        <div className="flex items-center gap-1.5 bg-surface border border-border px-[11px] py-1 rounded-[5px] font-head tracking-[0.3px]">
          <span className="text-[14px] font-bold leading-none text-teal">{fmt(totalCost)}</span>
          <span className="text-[9px] text-text-3 tracking-[1px] uppercase">Portfolio</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 bg-surface border border-border px-[11px] py-1 rounded-[5px] font-head tracking-[0.3px]">
          <span className="text-[14px] font-bold leading-none text-amber-brand">
            {Math.round(avgPct * 100)}%
          </span>
          <span className="text-[9px] text-text-3 tracking-[1px] uppercase">Progress</span>
        </div>

        {/* Data date — hidden on small screens */}
        <div className="hidden md:flex items-center gap-1.5 bg-surface border border-border px-[11px] py-1 rounded-[5px] font-head tracking-[0.3px]">
          <span className="text-[11px] font-bold leading-none text-text-2 font-mono">
            {lastUploadDate ?? 'Seed'}
          </span>
          <span className="text-[9px] text-text-3 tracking-[1px] uppercase">Data</span>
        </div>

        {/* Alert bell */}
        <button
          className="w-8 h-8 bg-surface border border-border rounded-[5px] flex items-center justify-center text-sm text-text-2 relative"
          title="3 alerts"
        >
          🔔
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red rounded-full font-mono text-[8px] text-white flex items-center justify-center leading-none">3</span>
        </button>
      </div>
    </header>
  )
}
