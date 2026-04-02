'use client'

import { useMemo, useRef } from 'react'
import ExportPdfButton from '@/components/ui/ExportPdfButton'
import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from 'recharts'
import { COLORS, useChartColors } from "@/lib/constants/themeColors"
import type { BuildingStatus } from '@/types/building'

const RISKS = [
  { id: 'R-001', title: 'Material supply delay — Rebar shortage', impact: 'High',   prob: 'Medium', status: 'open',       project: 'Florya City', score: 9 },
  { id: 'R-002', title: 'Weather disruption — rainy season',      impact: 'Medium', prob: 'High',   status: 'open',       project: 'Both',        score: 8 },
  { id: 'R-003', title: 'Contractor capacity constraint Block B', impact: 'High',   prob: 'Low',    status: 'monitoring', project: 'Shary Daik',  score: 6 },
  { id: 'R-004', title: 'Permit delay — Phase 3 buildings',       impact: 'High',   prob: 'Medium', status: 'open',       project: 'Florya City', score: 9 },
  { id: 'R-005', title: 'Budget overrun — foundation variance',   impact: 'Medium', prob: 'Medium', status: 'monitoring', project: 'Shary Daik',  score: 5 },
]

const IMPACT_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  High: 'stopped', Medium: 'pending', Low: 'neutral',
}
const STATUS_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  open: 'stopped', monitoring: 'pending', closed: 'done',
}
const SCORE_COLOR = (score: number) =>
  score >= 9 ? COLORS.red : score >= 6 ? COLORS.amber : COLORS.teal

function RiskTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { id: string; title: string; score: number } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg max-w-[200px]">
      <p className="text-text-2 font-bold">{d.id}</p>
      <p className="text-text-3 mt-0.5 leading-snug">{d.title}</p>
      <p className="mt-1" style={{ color: SCORE_COLOR(d.score) }}>Score: {d.score}/10</p>
    </div>
  )
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  )
}

export default function RiskPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const C = useChartColors()
  const { buildings } = useProjectStore()

  const riskMetrics = useMemo(() => {
    const florya = buildings.filter(b => b.proj === 'Florya City')
    const shary  = buildings.filter(b => b.proj === 'Shary Daik')
    const pct   = (arr: typeof buildings) => arr.length ? Math.round(arr.reduce((s, b) => s + b.pct, 0) / arr.length * 100) : 0
    const pctOf = (arr: typeof buildings, status: BuildingStatus) =>
      arr.length ? Math.round(arr.filter(b => b.status === status).length / arr.length * 100) : 0
    const avgDelay = (arr: typeof buildings) => {
      const delayed = arr.filter(b => (b.delayDays ?? 0) > 0)
      return delayed.length ? Math.round(delayed.reduce((s, b) => s + (b.delayDays ?? 0), 0) / delayed.length) : 0
    }
    return { florya, shary, pct, pctOf, avgDelay }
  }, [buildings])

  const delayDistData = useMemo(() => {
    const buckets = [
      { label: 'On time', min: -999, max: 0,   color: COLORS.teal },
      { label: '1–30d',   min: 1,    max: 30,   color: '#a3e635' },
      { label: '31–60d',  min: 31,   max: 60,   color: COLORS.amber },
      { label: '61–90d',  min: 61,   max: 90,   color: COLORS.orange },
      { label: '90d+',    min: 91,   max: 9999, color: COLORS.red },
    ]
    const bldgs = buildings.filter(b => b.delayDays !== undefined)
    if (bldgs.length === 0) return []
    return buckets.map(bk => ({
      label: bk.label,
      count: bldgs.filter(b => { const d = b.delayDays ?? 0; return d >= bk.min && d <= bk.max }).length,
      color: bk.color,
    })).filter(b => b.count > 0)
  }, [buildings])

  const radarData = useMemo(() => {
    const { florya, shary, pct, pctOf, avgDelay } = riskMetrics
    return [
      { dimension: 'Schedule',   Florya: pct(florya),                              Shary: pct(shary) },
      { dimension: 'Active %',   Florya: pctOf(florya, 'in progress'),             Shary: pctOf(shary, 'in progress') },
      { dimension: 'Completed',  Florya: pctOf(florya, 'Done'),                    Shary: pctOf(shary, 'Done') },
      { dimension: 'Stability',  Florya: 100 - pctOf(florya, 'Stopped'),           Shary: 100 - pctOf(shary, 'Stopped') },
      { dimension: 'Delay-Free', Florya: Math.max(0, 100 - Math.min(100, avgDelay(florya))), Shary: Math.max(0, 100 - Math.min(100, avgDelay(shary))) },
    ]
  }, [riskMetrics])

  const openRisks       = RISKS.filter(r => r.status === 'open').length
  const monitoringRisks = RISKS.filter(r => r.status === 'monitoring').length
  const highScoreRisks  = RISKS.filter(r => r.score >= 9).length
  const delayedCount    = buildings.filter(b => (b.delayDays ?? 0) > 0).length

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Schedule & Risk</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">Risk register · Delay analysis · Project health radar</p>
        </div>
        <ExportPdfButton
          contentRef={contentRef}
          opts={{ title: 'Schedule & Risk Report', filename: 'pske-risk-report', orientation: 'portrait' }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Risks"        value={openRisks}       icon="🔴" accent="red"    />
        <KpiCard label="Monitoring"         value={monitoringRisks} icon="⚠"  accent="amber"  />
        <KpiCard label="Critical Score ≥9" value={highScoreRisks}  icon="!"  sub="Impact × Probability" accent={highScoreRisks > 0 ? 'red' : 'neutral'} />
        <KpiCard label="Buildings Delayed"  value={delayedCount}   icon="📅" sub="Have delayDays > 0" accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card accent="red">
          <SectionHeader title="Risk Score Chart" subtitle="Sorted by severity" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height={208} minWidth={0}>
              <BarChart data={[...RISKS].sort((a, b) => b.score - a.score)} layout="vertical"
                margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: C.text3, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="id" width={44}
                  tick={{ fill: C.text2, fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<RiskTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {RISKS.map((r, i) => <Cell key={i} fill={SCORE_COLOR(r.score)} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-1 text-[10px] font-mono text-text-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-red" />Critical ≥9</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-amber-brand" />High 6–8</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block bg-teal" />Moderate &lt;6</span>
          </div>
        </Card>

        <Card accent="violet">
          <SectionHeader title="Project Health Radar" subtitle="5 dimensions · higher = better" />
          <div className="h-[230px] mt-1">
            <ResponsiveContainer width="100%" height={230} minWidth={0}>
              <RadarChart data={radarData} margin={{ top: 8, right: 28, left: 28, bottom: 8 }}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: C.text3, fontSize: 9, fontFamily: 'monospace' }} />
                <Radar name="Florya City" dataKey="Florya" stroke={COLORS.teal}  fill={COLORS.teal}  fillOpacity={0.18} strokeWidth={2} />
                <Radar name="Shary Daik"  dataKey="Shary"  stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.18} strokeWidth={2} />
                <Tooltip content={<RadarTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: C.text2 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {delayDistData.length > 0 && (
        <Card accent="amber">
          <SectionHeader title="Delay Distribution" subtitle="Buildings with date data, grouped by delay bucket" />
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height={176} minWidth={0}>
              <BarChart data={delayDistData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.text2, fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.text3, fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  formatter={(v: unknown) => [`${v} buildings`, 'Count']}
                  contentStyle={{ background: '#141c28', border: '1px solid #1e2d40', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}
                  labelStyle={{ color: C.text2 }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {delayDistData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card padding="none">
        <div className="p-4 border-b border-border">
          <SectionHeader title="Risk Register" subtitle="All registered risks" />
        </div>
        <div className="divide-y divide-border/40">
          {[...RISKS].sort((a, b) => b.score - a.score).map(risk => (
            <div key={risk.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface/30 transition-colors">
              <span className="font-mono text-[10px] text-text-3 w-14 flex-shrink-0">{risk.id}</span>
              <span
                className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-head font-bold text-sm"
                style={{ background: `${SCORE_COLOR(risk.score)}22`, color: SCORE_COLOR(risk.score) }}
              >
                {risk.score}
              </span>
              <span className="flex-1 text-sm font-body text-text-2 min-w-0 truncate">{risk.title}</span>
              <span className="text-[10px] text-text-3 font-body hidden md:block w-24 text-right flex-shrink-0">{risk.project}</span>
              <Badge variant={IMPACT_BADGE[risk.impact]}>I: {risk.impact}</Badge>
              <Badge variant={IMPACT_BADGE[risk.prob]}>P: {risk.prob}</Badge>
              <Badge variant={STATUS_BADGE[risk.status]}>{risk.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
