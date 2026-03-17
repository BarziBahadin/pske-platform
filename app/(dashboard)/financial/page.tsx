'use client'

import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'
import EmptyState from '@/components/ui/EmptyState'
import { useMemo } from 'react'

export default function FinancialPage() {
  const { buildings } = useProjectStore()

  const metrics = useMemo(() => {
    const bac  = buildings.reduce((s, b) => s + b.cost, 0)
    const ev   = buildings.reduce((s, b) => s + b.cost * b.pct, 0)
    const cpi: number = 1.0   // placeholder — needs actual cost from Excel
    const spi  = ev / bac
    const eac  = cpi !== 0 ? bac / cpi : bac
    const etc  = eac - ev

    const fmt = (n: number) =>
      n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`

    return { bac, ev, cpi, spi, eac, etc, fmt }
  }, [buildings])

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Financial</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Earned value · Cost performance · EAC/ETC</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Budget at Completion (BAC)" value={metrics.fmt(metrics.bac)} icon="$" accent="amber" />
        <KpiCard label="Earned Value (EV)" value={metrics.fmt(metrics.ev)} sub="Progress × budget" icon="◉" accent="teal" />
        <KpiCard
          label="CPI"
          value="—"
          sub="Needs actual cost data from Excel"
          accent="neutral"
        />
        <KpiCard
          label="SPI"
          value={metrics.spi.toFixed(2)}
          sub={metrics.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
          accent={metrics.spi >= 1 ? 'teal' : 'red'}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="EAC / ETC" subtitle="Estimate at/to Completion" />
          <div className="space-y-3">
            {[
              { label: 'Estimate at Completion (EAC)', value: metrics.fmt(metrics.eac), note: 'BAC / CPI' },
              { label: 'Estimate to Complete (ETC)', value: metrics.fmt(metrics.etc), note: 'EAC − EV' },
              { label: 'Variance at Completion (VAC)', value: metrics.fmt(metrics.bac - metrics.eac), note: 'BAC − EAC' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                <div>
                  <p className="text-sm font-body text-text-2">{r.label}</p>
                  <p className="text-[10px] text-text-3 font-mono mt-0.5">{r.note}</p>
                </div>
                <span className="font-head text-lg font-bold text-text">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader title="S-Curve" subtitle="Planned vs Actual — Phase 2" />
          <EmptyState icon="📈" title="S-Curve chart — Phase 2" description="Cumulative planned % vs actual % over time. Requires weekly baseline upload." />
        </Card>
      </div>
    </div>
  )
}
