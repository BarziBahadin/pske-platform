'use client'

import { useMemo, useRef } from 'react'
import { useProjectStore } from '@/lib/store/useProjectStore'
import ExportPdfButton from '@/components/ui/ExportPdfButton'
import KpiCard from '@/components/ui/KpiCard'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import ProgressRing from '@/components/ui/ProgressRing'
import TrendArrow from '@/components/ui/TrendArrow'
import SCurveChart from '@/components/charts/SCurveChart'
import StatusDonut from '@/components/charts/StatusDonut'
import ProgressHistogram from '@/components/charts/ProgressHistogram'
import { computeSCurve, computeDeltas } from '@/lib/derived/computeSCurve'
import type { BuildingStatus } from '@/types/building'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LabelList,
} from 'recharts'
import { COLORS } from '@/lib/constants/themeColors'

const STATUS_BADGE: Record<BuildingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Done:          'done',
  'in progress': 'progress',
  Stopped:       'stopped',
  Pending:       'pending',
  Collaps:       'collaps',
}

const STATUS_DONUT_COLORS: Record<string, string> = {
  'Done':        COLORS.teal,
  'in progress': COLORS.blue,
  'Stopped':     COLORS.red,
  'Pending':     COLORS.amber,
  'Collaps':     COLORS.violet,
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function ProjectTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <span className="text-teal font-bold">{payload[0].value}%</span>
      <span className="text-text-3 ml-1">avg completion</span>
    </div>
  )
}

export default function ExecutivePage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const { buildings, previousSnapshot, uploadHistory, lastUploadDate } = useProjectStore()

  const metrics = useMemo(() => {
    const total = buildings.length
    const byStatus = buildings.reduce<Record<string, number>>((acc, b) => {
      acc[b.status] = (acc[b.status] ?? 0) + 1
      return acc
    }, {})

    const done       = byStatus['Done'] ?? 0
    const inProgress = byStatus['in progress'] ?? 0
    const stopped    = byStatus['Stopped'] ?? 0
    const pending    = byStatus['Pending'] ?? 0
    const collapsed  = byStatus['Collaps'] ?? 0

    const totalCost = buildings.reduce((s, b) => s + b.cost, 0)
    const avgPct    = total ? buildings.reduce((s, b) => s + b.pct, 0) / total : 0
    const portfolioPct = Math.round(avgPct * 100)

    const florya    = buildings.filter(b => b.proj === 'Florya City')
    const shary     = buildings.filter(b => b.proj === 'Shary Daik')
    const floryaPct = florya.length ? Math.round(florya.reduce((s, b) => s + b.pct, 0) / florya.length * 100) : 0
    const sharyPct  = shary.length  ? Math.round(shary.reduce((s, b) => s + b.pct, 0) / shary.length * 100)  : 0
    const floryaCost = florya.reduce((s, b) => s + b.cost, 0)
    const sharyCost  = shary.reduce((s, b) => s + b.cost, 0)

    let prevPct: number | undefined
    if (previousSnapshot.length) {
      prevPct = Math.round(previousSnapshot.reduce((s, b) => s + b.pct, 0) / previousSnapshot.length * 100)
    }

    return { total, done, inProgress, stopped, pending, collapsed, totalCost, portfolioPct,
      floryaPct, sharyPct, florya, shary, floryaCost, sharyCost, prevPct }
  }, [buildings, previousSnapshot])

  const trendDelta = metrics.prevPct !== undefined ? metrics.portfolioPct - metrics.prevPct : undefined

  const sCurveData = useMemo(
    () => computeSCurve(buildings, lastUploadDate, uploadHistory),
    [buildings, lastUploadDate, uploadHistory],
  )

  const deltas = useMemo(
    () => computeDeltas(buildings, previousSnapshot),
    [buildings, previousSnapshot],
  )

  const donutData = [
    { name: 'Done',        value: metrics.done,       color: STATUS_DONUT_COLORS['Done'] },
    { name: 'In Progress', value: metrics.inProgress, color: STATUS_DONUT_COLORS['in progress'] },
    { name: 'Stopped',     value: metrics.stopped,    color: STATUS_DONUT_COLORS['Stopped'] },
    { name: 'Pending',     value: metrics.pending,    color: STATUS_DONUT_COLORS['Pending'] },
    { name: 'Collaps',     value: metrics.collapsed,  color: STATUS_DONUT_COLORS['Collaps'] },
  ].filter(d => d.value > 0)

  const projectCompareData = [
    { proj: 'Florya City', pct: metrics.floryaPct, budget: +(metrics.floryaCost / 1_000_000).toFixed(1), buildings: metrics.florya.length, color: COLORS.teal },
    { proj: 'Shary Daik',  pct: metrics.sharyPct,  budget: +(metrics.sharyCost / 1_000_000).toFixed(1),  buildings: metrics.shary.length,  color: COLORS.amber },
  ]

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Executive Summary</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            Portfolio · {metrics.total} buildings · {lastUploadDate ?? 'Seed data'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportPdfButton
            contentRef={contentRef}
            opts={{ title: 'Executive Summary', filename: 'pske-executive-summary', orientation: 'landscape' }}
          />
          <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
          <span className="font-mono text-xs text-teal">LIVE</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Portfolio Progress"
          value={`${metrics.portfolioPct}%`}
          sub="Weighted avg completion"
          icon="◉"
          accent="teal"
          trend={trendDelta}
          trendSuffix="%"
        />
        <KpiCard
          label="Total Contract Value"
          value={fmt(metrics.totalCost)}
          sub="All buildings combined"
          icon="$"
          accent="amber"
        />
        <KpiCard
          label="Completed"
          value={metrics.done}
          sub={`of ${metrics.total} total buildings`}
          icon="✓"
          accent="green"
        />
        <KpiCard
          label="Stopped / Collapsed"
          value={`${metrics.stopped + metrics.collapsed}`}
          sub={`${metrics.inProgress} active · ${metrics.pending} pending`}
          icon="⚠"
          accent={metrics.stopped > 10 ? 'red' : 'neutral'}
        />
      </div>

      {/* Status Donut + Project Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card accent="teal">
          <SectionHeader title="Status Breakdown" subtitle={`${metrics.total} buildings total`} />
          <StatusDonut data={donutData} totalLabel="buildings" totalValue={metrics.total} height={210} />
        </Card>

        <Card accent="amber">
          <SectionHeader title="Project Comparison" subtitle="Avg completion % & budget" />
          <div className="h-[130px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectCompareData} layout="vertical" margin={{ top: 0, right: 48, left: 4, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="proj"
                  width={80}
                  tick={{ fill: COLORS.text2, fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ProjectTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {projectCompareData.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.8} />
                  ))}
                  <LabelList
                    dataKey="pct"
                    position="right"
                    formatter={(v: unknown) => `${v}%`}
                    style={{ fill: COLORS.text2, fontSize: 11, fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {projectCompareData.map(p => (
              <div key={p.proj} className="bg-surface/60 rounded-lg p-3 border border-border/40">
                <p className="text-[10px] font-mono text-text-3 truncate">{p.proj}</p>
                <p className="font-head text-xl font-bold mt-1" style={{ color: p.color }}>{p.pct}%</p>
                <p className="text-[10px] font-mono text-text-3">{p.buildings} bldgs · ${p.budget}M</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Progress Distribution */}
      <Card accent="blue">
        <SectionHeader title="Progress Distribution" subtitle="Buildings by completion bucket" />
        <ProgressHistogram buildings={buildings} height={170} />
      </Card>

      {/* S-Curve */}
      <Card accent="teal" glow>
        <SectionHeader
          title="S-Curve — Portfolio Progress"
          subtitle={
            sCurveData.length < 2
              ? 'Upload more snapshots to grow the curve'
              : `${sCurveData.length} data points · teal = actual · amber dashed = planned`
          }
          action={
            trendDelta !== undefined
              ? <TrendArrow value={trendDelta} suffix="pp vs last upload" />
              : undefined
          }
        />
        <div className="mt-2">
          <SCurveChart data={sCurveData} />
        </div>
        {sCurveData.length < 2 && (
          <p className="text-center text-[11px] text-text-3 font-mono mt-2 pb-1">
            {sCurveData.length === 1
              ? `Current: ${sCurveData[0].actual.toFixed(1)}% — upload next report to build the curve`
              : 'No data — upload an Excel file to start'}
          </p>
        )}
      </Card>

      {/* Project rings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Project Completion Rings" subtitle="Progress by sub-project" />
          <div className="grid grid-cols-2 gap-4">
            {([
              { name: 'Florya City', pct: metrics.floryaPct, count: metrics.florya.length, color: COLORS.teal },
              { name: 'Shary Daik',  pct: metrics.sharyPct,  count: metrics.shary.length,  color: COLORS.amber },
            ] as const).map(proj => (
              <div key={proj.name} className="flex flex-col items-center gap-3 py-3">
                <ProgressRing pct={proj.pct} size={88} stroke={7} color={proj.color} />
                <div className="text-center">
                  <p className="font-head text-sm font-bold text-text">{proj.name}</p>
                  <p className="font-mono text-[10px] text-text-3">{proj.count} buildings</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Status bars */}
        <Card>
          <SectionHeader title="Status Distribution" subtitle="All buildings" />
          <div className="space-y-2.5 mt-1">
            {(
              [
                { status: 'Done',        count: metrics.done,       label: 'Done',       color: COLORS.teal },
                { status: 'in progress', count: metrics.inProgress, label: 'In Progress',color: COLORS.blue },
                { status: 'Pending',     count: metrics.pending,    label: 'Pending',    color: COLORS.amber },
                { status: 'Stopped',     count: metrics.stopped,    label: 'Stopped',    color: COLORS.red },
                { status: 'Collaps',     count: metrics.collapsed,  label: 'Collapsed',  color: COLORS.violet },
              ] as const
            ).map(({ status, count, label, color }) => {
              const pct = metrics.total ? Math.round((count / metrics.total) * 100) : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <Badge variant={STATUS_BADGE[status as BuildingStatus]}>{label}</Badge>
                  </div>
                  <div className="flex-1 bg-bg rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="font-mono text-xs text-text-2 w-14 text-right">
                    {count} <span className="text-text-3">({pct}%)</span>
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Snapshot Delta Table */}
      <Card padding="none" accent="violet">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <span className="text-[12px] text-text-2 font-head font-semibold tracking-wide uppercase">
              Snapshot Delta
            </span>
            <span className="ml-2 text-[11px] text-text-3 font-mono">
              {deltas.length > 0
                ? `${deltas.length} buildings changed since last upload`
                : previousSnapshot.length === 0
                  ? 'Upload a second file to see changes'
                  : 'No changes vs last upload'}
            </span>
          </div>
          {lastUploadDate && (
            <span className="font-mono text-[10px] text-text-3 bg-surface border border-border px-2 py-1 rounded-md">
              {lastUploadDate}
            </span>
          )}
        </div>

        {deltas.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-text-3 text-center font-mono">
            {previousSnapshot.length === 0
              ? 'No previous snapshot — upload a second Excel report to compare.'
              : 'All progress values are identical to the previous upload.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  {['Building', 'Project', 'Prev %', 'Curr %', 'Delta', 'Status Change'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-text-3 font-mono font-normal tracking-wide uppercase text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deltas.slice(0, 20).map((d, i) => (
                  <tr key={`${d.proj}__${d.bldg}__${i}`} className="border-b border-border/40 hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-teal">{d.bldg}</td>
                    <td className="px-4 py-2.5 text-text-2">{d.proj}</td>
                    <td className="px-4 py-2.5 font-mono text-text-3">{d.prevPct}%</td>
                    <td className="px-4 py-2.5 font-mono text-text">{d.currPct}%</td>
                    <td className="px-4 py-2.5">
                      <TrendArrow value={d.delta} suffix="pp" />
                    </td>
                    <td className="px-4 py-2.5">
                      {d.prevStatus !== d.currStatus ? (
                        <span className="flex items-center gap-1.5 text-[11px] font-mono">
                          <Badge variant={STATUS_BADGE[d.prevStatus as BuildingStatus]}>{d.prevStatus}</Badge>
                          <span className="text-text-3">→</span>
                          <Badge variant={STATUS_BADGE[d.currStatus as BuildingStatus]}>{d.currStatus}</Badge>
                        </span>
                      ) : (
                        <span className="text-text-3 text-[11px] font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deltas.length > 20 && (
              <p className="px-4 py-2.5 text-[11px] text-text-3 border-t border-border/40 font-mono">
                + {deltas.length - 20} more changes not shown
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
