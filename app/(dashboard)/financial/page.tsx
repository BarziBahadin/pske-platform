'use client'

import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { useMemo, useRef } from 'react'
import ExportPdfButton from '@/components/ui/ExportPdfButton'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid, Cell, LabelList, ReferenceLine,
} from 'recharts'
import { COLORS, useChartColors } from "@/lib/constants/themeColors"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000)  return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000)      return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}
function fmtM(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`
}
const cpiColor = (cpi: number) =>
  cpi >= 1.05 ? COLORS.teal : cpi >= 0.95 ? COLORS.amber : COLORS.red

// ── Tooltip components ────────────────────────────────────────────────────────

function BudgetTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg min-w-[160px]">
      <p className="text-text-2 mb-1.5 font-bold">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmtM(p.value)}
        </p>
      ))}
      {payload.length === 3 && (
        <p className="mt-1 border-t border-border/40 pt-1 text-text-3">
          CV: {fmtM(payload[1].value - payload[2].value)}
        </p>
      )}
    </div>
  )
}

function CpiTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  const cpi = payload[0].value
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <p className="text-text-2 font-bold mb-1">{label}</p>
      <p style={{ color: cpiColor(cpi) }}>CPI: <span className="font-bold">{cpi.toFixed(3)}</span></p>
      <p className="text-text-3 mt-0.5">
        {cpi >= 1.05 ? 'Under budget' : cpi >= 0.95 ? 'Near budget' : 'Over budget'}
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinancialPage() {
  const C = useChartColors()
  const contentRef = useRef<HTMLDivElement>(null)
  const { buildings } = useProjectStore()

  // ── Portfolio-level EVM ───────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const bac = buildings.reduce((s, b) => s + b.cost, 0)
    const ev  = buildings.reduce((s, b) => s + b.cost * b.pct, 0)
    const acBuildings = buildings.filter(b => b.actualCost != null)
    const hasAC = acBuildings.length > 0
    const ac  = acBuildings.reduce((s, b) => s + (b.actualCost ?? 0), 0)

    // When we only have partial AC (subset of buildings), EV for those buildings
    const evAC = acBuildings.reduce((s, b) => s + b.cost * b.pct, 0)

    const cpi = hasAC && ac > 0 ? evAC / ac : null
    const spi = bac > 0 ? ev / bac : 0
    const eac = cpi != null && cpi > 0 ? bac / cpi : bac
    const etc = eac - ev
    const vac = bac - eac
    const cv  = hasAC ? evAC - ac : null
    const sv  = ev - (bac * spi) // SV = EV - PV; PV ≈ BAC * SPI (circular but illustrative)

    return { bac, ev, ac, cpi, spi, eac, etc, vac, cv, sv, hasAC, acCount: acBuildings.length }
  }, [buildings])

  // ── Package-level: Budget vs EV vs AC ─────────────────────────────────────
  const packageData = useMemo(() => {
    const groups = new Map<string, { bac: number; ev: number; ac: number; acCount: number }>()
    buildings.forEach(b => {
      const g = groups.get(b.desc) ?? { bac: 0, ev: 0, ac: 0, acCount: 0 }
      g.bac += b.cost
      g.ev  += b.cost * b.pct
      if (b.actualCost != null) { g.ac += b.actualCost; g.acCount++ }
      groups.set(b.desc, g)
    })
    return Array.from(groups.entries())
      .map(([name, v]) => ({
        name: name.length > 14 ? name.slice(0, 13) + '…' : name,
        'Budget':  +(v.bac / 1_000_000).toFixed(3),
        'Earned':  +(v.ev  / 1_000_000).toFixed(3),
        'Actual':  v.acCount > 0 ? +(v.ac / 1_000_000).toFixed(3) : null,
        cpi:       v.acCount > 0 && v.ac > 0 ? v.ev / v.ac : null,
      }))
      .sort((a, b) => b['Budget'] - a['Budget'])
      .slice(0, 10)
  }, [buildings])

  // ── CPI per building (those with actualCost) ──────────────────────────────
  const cpiData = useMemo(() => {
    return buildings
      .filter(b => b.actualCost != null && b.actualCost > 0 && b.pct > 0)
      .map(b => {
        const ev = b.cost * b.pct
        const cpi = ev / (b.actualCost ?? 1)
        return { name: b.bldg, cpi: +cpi.toFixed(3), ev, ac: b.actualCost ?? 0 }
      })
      .sort((a, b) => a.cpi - b.cpi)
  }, [buildings])

  // ── Per-project summary ───────────────────────────────────────────────────
  const projectSummary = useMemo(() => {
    const projs = ['Florya City', 'Shary Daik'] as const
    return projs.map(p => {
      const rows = buildings.filter(b => b.proj === p)
      const bac  = rows.reduce((s, b) => s + b.cost, 0)
      const ev   = rows.reduce((s, b) => s + b.cost * b.pct, 0)
      const acRows = rows.filter(b => b.actualCost != null)
      const ac   = acRows.reduce((s, b) => s + (b.actualCost ?? 0), 0)
      const evAC = acRows.reduce((s, b) => s + b.cost * b.pct, 0)
      const cpi  = ac > 0 ? evAC / ac : null
      const spi  = bac > 0 ? ev / bac : 0
      const eac  = cpi != null && cpi > 0 ? bac / cpi : bac
      return { proj: p, bac, ev, ac, cpi, spi, eac, hasAC: acRows.length > 0 }
    })
  }, [buildings])

  const cpiVal  = metrics.cpi
  const cpiGood = cpiVal != null && cpiVal >= 0.95

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Financial</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            Earned value · CPI/SPI · EAC/ETC · Cost variance
            {metrics.hasAC && <span className="ml-2 text-teal">· {metrics.acCount} buildings with actual cost data</span>}
          </p>
        </div>
        <ExportPdfButton
          contentRef={contentRef}
          opts={{ title: 'Financial Report', filename: 'pske-financial-report', orientation: 'portrait' }}
        />
      </div>

      {/* ── KPI Row 1: Core EVM ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Budget at Completion" value={fmt(metrics.bac)} icon="$" accent="amber"
          sub="Total contract value" />
        <KpiCard label="Earned Value (EV)" value={fmt(metrics.ev)} icon="◉" accent="teal"
          sub="Progress × budget" />
        <KpiCard
          label="CPI"
          value={cpiVal != null ? cpiVal.toFixed(3) : '—'}
          sub={cpiVal != null
            ? (cpiVal >= 1 ? 'Under budget' : 'Over budget')
            : 'Upload actual cost to enable'}
          accent={cpiVal == null ? 'neutral' : cpiGood ? 'teal' : 'red'}
        />
        <KpiCard
          label="SPI"
          value={metrics.spi.toFixed(3)}
          sub={metrics.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}
          accent={metrics.spi >= 1 ? 'teal' : 'red'}
        />
      </div>

      {/* ── KPI Row 2: Variance ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="EAC" value={fmt(metrics.eac)} icon="⊕" accent="blue"
          sub={cpiVal != null ? 'BAC ÷ CPI (forecast)' : 'BAC (CPI=1 placeholder)'} />
        <KpiCard label="ETC" value={fmt(metrics.etc)} icon="→" accent="violet"
          sub="Remaining to spend (EAC − EV)" />
        <KpiCard
          label="VAC"
          value={fmt(metrics.vac)}
          sub={metrics.vac >= 0 ? 'Projected surplus' : 'Projected overrun'}
          accent={metrics.vac >= 0 ? 'green' : 'red'}
        />
        <KpiCard
          label="Cost Variance (CV)"
          value={metrics.cv != null ? fmt(metrics.cv) : '—'}
          sub={metrics.cv != null
            ? (metrics.cv >= 0 ? 'EV − AC · under budget' : 'EV − AC · over budget')
            : 'Requires actual cost data'}
          accent={metrics.cv == null ? 'neutral' : metrics.cv >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* ── Budget vs EV vs AC bar chart ─────────────────────────────────── */}
      <Card accent="amber">
        <SectionHeader
          title="Budget vs Earned vs Actual — by Package"
          subtitle="Top 10 packages by contract value · $M"
        />
        <div className="h-72 mt-2">
          <ResponsiveContainer width="100%" height={288} minWidth={0}>
            <BarChart data={packageData} margin={{ top: 4, right: 8, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: C.text2, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fill: C.text3, fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${v}M`}
                width={46}
              />
              <Tooltip content={<BudgetTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: C.text2, paddingTop: 8 }} />
              <Bar dataKey="Budget" fill={COLORS.amber}  fillOpacity={0.45} radius={[3,3,0,0]} maxBarSize={24} />
              <Bar dataKey="Earned" fill={COLORS.teal}   fillOpacity={0.80} radius={[3,3,0,0]} maxBarSize={24} />
              <Bar dataKey="Actual" fill={COLORS.violet} fillOpacity={0.70} radius={[3,3,0,0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── CPI per building + Project breakdown ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* CPI per building */}
        {cpiData.length > 0 ? (
          <Card accent="red">
            <SectionHeader title="CPI per Building" subtitle="Sorted worst → best · 1.00 = on budget" />
            <div className="h-64 mt-2">
              <ResponsiveContainer width="100%" height={256} minWidth={0}>
                <BarChart data={cpiData} layout="vertical" margin={{ top: 0, right: 56, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0.6, 1.2]}
                    tick={{ fill: C.text3, fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={7}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={52}
                    tick={{ fill: C.text2, fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CpiTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <ReferenceLine x={1} stroke={COLORS.text3} strokeDasharray="4 4" strokeWidth={1} />
                  <Bar dataKey="cpi" radius={[0,4,4,0]} maxBarSize={16}>
                    {cpiData.map((d, i) => (
                      <Cell key={i} fill={cpiColor(d.cpi)} fillOpacity={0.85} />
                    ))}
                    <LabelList
                      dataKey="cpi"
                      position="right"
                      formatter={(v: unknown) => Number(v).toFixed(2)}
                      style={{ fill: C.text2, fontSize: 9, fontFamily: 'monospace' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-1 text-[10px] font-mono text-text-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: COLORS.teal }} />≥1.05 Under budget</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: COLORS.amber }} />0.95–1.05 Near budget</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: COLORS.red }} />&lt;0.95 Over budget</span>
            </div>
          </Card>
        ) : (
          <Card accent="red">
            <SectionHeader title="CPI per Building" subtitle="Requires actual cost data from Excel" />
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-sm text-text-2 font-body">No actual cost data yet</p>
                <p className="text-xs text-text-3 font-mono mt-1">Upload Excel with &quot;Actual Cost&quot; column to enable CPI</p>
              </div>
            </div>
          </Card>
        )}

        {/* Project breakdown */}
        <Card accent="teal">
          <SectionHeader title="Project EVM Breakdown" subtitle="BAC · EV · CPI · SPI per project" />
          <div className="space-y-0 mt-2">
            {projectSummary.map(p => {
              const evPct = p.bac > 0 ? p.ev / p.bac : 0
              return (
                <div key={p.proj} className="py-3 border-b border-border/40 last:border-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-body text-text-2 font-semibold">{p.proj}</span>
                    <span className="font-head text-base font-bold text-text">{fmt(p.bac)}</span>
                  </div>

                  {/* EV progress bar */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-text-3 w-8">EV</span>
                    <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, evPct * 100)}%`, background: COLORS.teal }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-teal w-10 text-right">{fmt(p.ev)}</span>
                  </div>

                  {/* AC progress bar (if available) */}
                  {p.hasAC && (
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-text-3 w-8">AC</span>
                      <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, (p.ac / p.bac) * 100)}%`, background: COLORS.violet }}
                        />
                      </div>
                      <span className="text-[10px] font-mono w-10 text-right" style={{ color: COLORS.violet }}>{fmt(p.ac)}</span>
                    </div>
                  )}

                  <div className="flex gap-4 mt-1.5">
                    <span className={`text-xs font-mono tabular-nums ${p.spi >= 1 ? 'text-teal' : 'text-amber-400'}`}>
                      SPI {p.spi.toFixed(2)}
                    </span>
                    {p.cpi != null && (
                      <span className="text-xs font-mono tabular-nums" style={{ color: cpiColor(p.cpi) }}>
                        CPI {p.cpi.toFixed(2)}
                      </span>
                    )}
                    {p.cpi != null && (
                      <span className="text-xs font-mono text-text-3 ml-auto">
                        EAC {fmt(p.eac)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── EAC / ETC / VAC table ────────────────────────────────────────── */}
      <Card accent="blue">
        <SectionHeader title="EVM Summary Table" subtitle="Portfolio-level earned value metrics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-2">
          {[
            { label: 'Budget at Completion (BAC)',  value: fmt(metrics.bac),  note: 'Total contract value',                color: COLORS.amber },
            { label: 'Earned Value (EV)',            value: fmt(metrics.ev),   note: 'Progress × budget',                   color: COLORS.teal },
            { label: 'Actual Cost (AC)',             value: metrics.hasAC ? fmt(metrics.ac) : '—', note: metrics.hasAC ? `${metrics.acCount} buildings with data` : 'Upload Excel with AC column', color: COLORS.violet },
            { label: 'Cost Performance Index (CPI)',value: metrics.cpi != null ? metrics.cpi.toFixed(3) : '—', note: 'EV ÷ AC · >1 under budget', color: metrics.cpi != null ? cpiColor(metrics.cpi) : COLORS.text3 },
            { label: 'Schedule Performance (SPI)',  value: metrics.spi.toFixed(3), note: 'EV ÷ BAC · >1 ahead',           color: metrics.spi >= 1 ? COLORS.teal : COLORS.amber },
            { label: 'Cost Variance (CV)',           value: metrics.cv != null ? fmt(metrics.cv) : '—', note: 'EV − AC · positive = under', color: metrics.cv != null ? (metrics.cv >= 0 ? COLORS.teal : COLORS.red) : COLORS.text3 },
            { label: 'Estimate at Completion (EAC)', value: fmt(metrics.eac), note: metrics.cpi != null ? 'BAC ÷ CPI (forecast)' : 'BAC (CPI=1 placeholder)', color: COLORS.blue },
            { label: 'Estimate to Complete (ETC)',   value: fmt(metrics.etc), note: 'EAC − EV (remaining spend)',          color: COLORS.blue },
            { label: 'Variance at Completion (VAC)', value: fmt(metrics.vac), note: 'BAC − EAC · positive = surplus',      color: metrics.vac >= 0 ? COLORS.teal : COLORS.red },
          ].map(r => (
            <div key={r.label} className="flex justify-between items-center py-2.5 px-1 border-b border-border/40 last:border-0">
              <div>
                <p className="text-sm font-body text-text-2">{r.label}</p>
                <p className="text-[10px] text-text-3 font-mono mt-0.5">{r.note}</p>
              </div>
              <span className="font-head text-lg font-bold ml-4 tabular-nums" style={{ color: r.color }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
