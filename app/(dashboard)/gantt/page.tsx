'use client'

import { useMemo, useState, useRef } from 'react'
import ExportPdfButton from '@/components/ui/ExportPdfButton'
import { format } from 'date-fns'
import { useProjectStore } from '@/lib/store/useProjectStore'
import { computeGantt, groupGanttRows, type GanttData, type GanttRow } from '@/lib/derived/computeGantt'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'
import EmptyState from '@/components/ui/EmptyState'

const STATUS_DOT: Record<string, string> = {
  'Done':        'bg-teal-400',
  'in progress': 'bg-blue-400',
  'Stopped':     'bg-red-400',
  'Pending':     'bg-amber-400',
  'Collaps':     'bg-violet-400',
}

export default function GanttPage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const { buildings } = useProjectStore()
  const [projFilter, setProjFilter] = useState('All')
  const [showDelayed, setShowDelayed] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    buildings.filter(b => {
      if (projFilter !== 'All' && b.proj !== projFilter) return false
      if (showDelayed && (b.delayDays ?? 0) <= 0) return false
      if (search) {
        const q = search.toLowerCase()
        if (!b.bldg.toLowerCase().includes(q) && !b.desc.toLowerCase().includes(q)) return false
      }
      return true
    }),
    [buildings, projFilter, showDelayed, search]
  )

  const gantt = useMemo(() => computeGantt(filtered), [filtered])

  const kpis = useMemo(() => {
    if (!gantt) return null
    const total   = gantt.rows.length
    const delayed = gantt.rows.filter(r => r.delayDays > 0)
    const onTime  = total - delayed.length
    const done    = gantt.rows.filter(r => r.status === 'Done').length
    const avgDelay = delayed.length > 0
      ? Math.round(delayed.reduce((s, r) => s + r.delayDays, 0) / delayed.length)
      : 0
    return { total, onTime, delayed: delayed.length, done, avgDelay }
  }, [gantt])

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Gantt Schedule</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">Construction timeline · Florya City & Shary Daik</p>
        </div>
        <ExportPdfButton
          contentRef={contentRef}
          opts={{ title: 'Gantt Schedule', filename: 'pske-gantt-schedule', orientation: 'landscape' }}
        />
      </div>

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Buildings w/ Timeline" value={String(kpis.total)} icon="≡" accent="teal" />
          <KpiCard
            label="On Schedule"
            value={String(kpis.onTime)}
            sub={`${kpis.total > 0 ? Math.round((kpis.onTime / kpis.total) * 100) : 0}% of total`}
            icon="✓"
            accent="teal"
          />
          <KpiCard
            label="Delayed"
            value={String(kpis.delayed)}
            sub={kpis.avgDelay > 0 ? `avg +${kpis.avgDelay} days` : 'none delayed'}
            icon="⚠"
            accent={kpis.delayed > 0 ? 'red' : 'neutral'}
          />
          <KpiCard label="Completed" value={String(kpis.done)} sub="Fully done" icon="★" accent="amber" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['All', 'Florya City', 'Shary Daik'] as const).map(p => (
          <button
            key={p}
            onClick={() => setProjFilter(p)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
              projFilter === p
                ? 'bg-teal text-bg font-bold'
                : 'bg-surface text-text-2 border border-border hover:border-teal/50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => setShowDelayed(v => !v)}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
            showDelayed
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-surface border-border text-text-2 hover:border-red-400/40'
          }`}
        >
          ⚠ Delayed only
        </button>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search building…"
          className="ml-auto px-3 py-1 rounded text-xs font-mono bg-surface border border-border text-text placeholder:text-text-3 focus:outline-none focus:border-teal/50 w-44"
        />
      </div>

      <Card>
        {!gantt ? (
          <EmptyState
            icon="≡"
            title="No timeline data"
            description="Upload an Excel file with plannedStart, plannedEnd and actualStart columns to see the Gantt chart. Seed buildings 1–20 include demo dates."
          />
        ) : (
          <>
            <SectionHeader
              title="Construction Timeline"
              subtitle={`${gantt.rows.length} buildings · ${format(gantt.domain.start, 'MMM yyyy')} – ${format(gantt.domain.end, 'MMM yyyy')}`}
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4 text-[10px] font-mono text-text-3">
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-2.5 rounded inline-block bg-amber-400/25 border border-amber-400/50" />
                Planned
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-2.5 rounded inline-block bg-teal/60" />
                Actual progress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-2.5 rounded inline-block bg-red-400/60" />
                Delay overrun
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-px h-3 inline-block bg-teal/70" />
                Today
              </span>
            </div>

            <GanttTimeline gantt={gantt} />
          </>
        )}
      </Card>
    </div>
  )
}

function GanttTimeline({ gantt }: { gantt: GanttData }) {
  const grouped = useMemo(() => groupGanttRows(gantt.rows), [gantt.rows])

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">

        {/* Timeline header */}
        <div className="grid gap-0 mb-1" style={{ gridTemplateColumns: '140px 1fr 40px' }}>
          <div className="text-[9px] font-mono text-text-3 uppercase tracking-widest flex items-end pb-1">Building</div>
          <div className="relative h-7 border-b border-border/40">
            {/* Quarter labels */}
            {gantt.domain.quarters.map((q, i) => (
              <span
                key={i}
                className="absolute bottom-1 text-[9px] font-mono text-text-3 translate-x-1 pointer-events-none select-none"
                style={{ left: `${q.offsetPct}%` }}
              >
                {q.label}
              </span>
            ))}
            {/* Quarter tick marks */}
            {gantt.domain.quarters.map((q, i) => (
              <div
                key={`tk-${i}`}
                className="absolute bottom-0 w-px h-2 bg-border/60"
                style={{ left: `${q.offsetPct}%` }}
              />
            ))}
            {/* Today marker in header */}
            {gantt.domain.todayPct > 0 && gantt.domain.todayPct < 100 && (
              <div
                className="absolute top-0 h-full w-px bg-teal/50"
                style={{ left: `${gantt.domain.todayPct}%` }}
              />
            )}
          </div>
          <div />
        </div>

        {/* Grouped rows */}
        {grouped.map(({ proj, groups }) => (
          <div key={proj}>
            {/* Project header */}
            <div className="grid gap-0 mt-3 mb-0.5" style={{ gridTemplateColumns: '140px 1fr 40px' }}>
              <div className="text-[9px] font-mono text-text-3 font-bold uppercase tracking-widest truncate py-0.5">
                {proj}
              </div>
              <div className="relative border-b border-border/20">
                {gantt.domain.todayPct > 0 && gantt.domain.todayPct < 100 && (
                  <div className="absolute inset-y-0 w-px bg-teal/20" style={{ left: `${gantt.domain.todayPct}%` }} />
                )}
              </div>
              <div />
            </div>

            {groups.map(({ desc, rows }) => (
              <div key={desc}>
                {/* Package description sub-header */}
                <div className="grid gap-0 mb-0.5" style={{ gridTemplateColumns: '140px 1fr 40px' }}>
                  <div className="text-[9px] font-mono text-teal/60 pl-1 truncate py-0.5 italic">{desc}</div>
                  <div className="relative">
                    {gantt.domain.todayPct > 0 && gantt.domain.todayPct < 100 && (
                      <div className="absolute inset-y-0 w-px bg-teal/10" style={{ left: `${gantt.domain.todayPct}%` }} />
                    )}
                  </div>
                  <div />
                </div>

                {rows.map((row, i) => (
                  <GanttRow key={`${row.proj}__${row.bldg}__${i}`} row={row} todayPct={gantt.domain.todayPct} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function GanttRow({ row, todayPct }: { row: GanttRow; todayPct: number }) {
  return (
    <div
      className="grid gap-0 group hover:bg-white/[0.02] rounded"
      style={{ gridTemplateColumns: '140px 1fr 40px' }}
    >
      {/* Label */}
      <div className="flex items-center gap-1.5 pr-2 py-[3px]">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[row.status] ?? 'bg-text-3'}`} />
        <span
          className="text-[11px] font-mono text-text-2 truncate group-hover:text-text transition-colors"
          title={`${row.bldg} · ${row.desc}`}
        >
          {row.bldg}
        </span>
      </div>

      {/* Bar area */}
      <div className="relative h-5 flex items-center">
        {/* Today marker */}
        {todayPct > 0 && todayPct < 100 && (
          <div
            className="absolute inset-y-0 w-px bg-teal/40 z-20 pointer-events-none"
            style={{ left: `${todayPct}%` }}
          />
        )}

        {/* Planned bar (background) */}
        <div
          className="absolute top-[5px] h-2.5 rounded bg-amber-400/20 border border-amber-400/40"
          style={{
            left: `${row.planOffsetPct}%`,
            width: `${Math.max(row.planWidthPct, 0.3)}%`,
          }}
        />

        {/* Actual progress bar */}
        {row.pct > 0 && (
          <div
            className={`absolute top-[5px] h-2.5 rounded ${
              row.status === 'Done' ? 'bg-teal/80' : 'bg-teal/55'
            }`}
            style={{
              left: `${row.planOffsetPct}%`,
              width: `${row.actualWidthPct}%`,
            }}
          />
        )}

        {/* Delay overrun bar */}
        {row.delayDays > 0 && (
          <div
            className="absolute top-[5px] h-2.5 rounded-r bg-red-400/50 border border-red-400/30"
            style={{
              left: `${row.planOffsetPct + row.planWidthPct}%`,
              width: `${Math.max(row.delayWidthPct, 0.3)}%`,
            }}
          />
        )}
      </div>

      {/* % label */}
      <div className="flex items-center justify-end pr-1">
        <span
          className={`text-[10px] font-mono tabular-nums ${
            row.pct >= 1 ? 'text-teal' : row.delayDays > 0 ? 'text-red-400' : 'text-text-3'
          }`}
        >
          {Math.round(row.pct * 100)}%
        </span>
      </div>
    </div>
  )
}
