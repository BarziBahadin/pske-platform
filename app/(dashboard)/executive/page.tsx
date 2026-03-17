'use client'

import { useMemo } from 'react'
import { useProjectStore } from '@/lib/store/useProjectStore'
import KpiCard from '@/components/ui/KpiCard'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import ProgressRing from '@/components/ui/ProgressRing'
import TrendArrow from '@/components/ui/TrendArrow'
import SCurveChart from '@/components/charts/SCurveChart'
import { computeSCurve, computeDeltas } from '@/lib/derived/computeSCurve'
import type { BuildingStatus } from '@/types/building'

const STATUS_BADGE: Record<BuildingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Done:          'done',
  'in progress': 'progress',
  Stopped:       'stopped',
  Pending:       'pending',
  Collaps:       'collaps',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export default function ExecutivePage() {
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

    const florya    = buildings.filter((b) => b.proj === 'Florya City')
    const shary     = buildings.filter((b) => b.proj === 'Shary Daik')
    const floryaPct = florya.length ? Math.round(florya.reduce((s, b) => s + b.pct, 0) / florya.length * 100) : 0
    const sharyPct  = shary.length  ? Math.round(shary.reduce((s, b) => s + b.pct, 0) / shary.length * 100)  : 0

    let prevPct: number | undefined
    if (previousSnapshot.length) {
      prevPct = Math.round(previousSnapshot.reduce((s, b) => s + b.pct, 0) / previousSnapshot.length * 100)
    }

    return { total, done, inProgress, stopped, pending, collapsed, totalCost, portfolioPct, floryaPct, sharyPct, florya, shary, prevPct }
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

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Executive Summary</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            Portfolio · {metrics.total} buildings · {lastUploadDate ?? 'Seed data'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-teal rounded-full animate-pulse" />
          <span className="font-mono text-xs text-teal">LIVE</span>
        </div>
      </div>

      {/* KPI row */}
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
          accent="teal"
        />
        <KpiCard
          label="Active / Stopped"
          value={`${metrics.inProgress} / ${metrics.stopped}`}
          sub={`${metrics.pending} pending · ${metrics.collapsed} collapsed`}
          icon="⚡"
          accent={metrics.stopped > 10 ? 'red' : 'neutral'}
        />
      </div>

      {/* S-Curve */}
      <Card>
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

      {/* Project breakdown + Status distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Project rings */}
        <Card>
          <SectionHeader title="Project Breakdown" subtitle="Progress by sub-project" />
          <div className="grid grid-cols-2 gap-4">
            {([
              { name: 'Florya City', pct: metrics.floryaPct, count: metrics.florya.length, color: '#0dd9c4' },
              { name: 'Shary Daik',  pct: metrics.sharyPct,  count: metrics.shary.length,  color: '#f5a623' },
            ] as const).map((proj) => (
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

        {/* Status distribution */}
        <Card>
          <SectionHeader title="Status Distribution" subtitle="All buildings" />
          <div className="space-y-2.5">
            {(
              [
                { status: 'Done',        count: metrics.done,       label: 'Done' },
                { status: 'in progress', count: metrics.inProgress, label: 'In Progress' },
                { status: 'Pending',     count: metrics.pending,    label: 'Pending' },
                { status: 'Stopped',     count: metrics.stopped,    label: 'Stopped' },
                { status: 'Collaps',     count: metrics.collapsed,  label: 'Collapsed' },
              ] as const
            ).map(({ status, count, label }) => {
              const pct = metrics.total ? Math.round((count / metrics.total) * 100) : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <Badge variant={STATUS_BADGE[status as BuildingStatus]}>{label}</Badge>
                  </div>
                  <div className="flex-1 bg-bg rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: status === 'Done' ? '#0dd9c4'
                          : status === 'in progress' ? '#3b82f6'
                          : status === 'Stopped' ? '#ef4444'
                          : status === 'Pending' ? '#f5a623'
                          : '#a855f7',
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-text-2 w-10 text-right">
                    {count} <span className="text-text-3">({pct}%)</span>
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Snapshot Delta Table */}
      <Card padding="none">
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
