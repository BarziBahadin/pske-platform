'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import Badge from '@/components/ui/Badge'
import StatusDonut from '@/components/charts/StatusDonut'
import ProgressHistogram from '@/components/charts/ProgressHistogram'
import type { Building, BuildingStatus } from '@/types/building'
import { COLORS } from '@/lib/constants/themeColors'

// ── Column config ─────────────────────────────────────────────────────────────

const STATUS_BADGE_MAP: Record<BuildingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Done:          'done',
  'in progress': 'progress',
  Stopped:       'stopped',
  Pending:       'pending',
  Collaps:       'collaps',
}

const col = createColumnHelper<Building>()

const COLUMNS = [
  col.accessor('n', {
    header: '#',
    size: 48,
    cell: i => <span className="font-mono text-xs text-text-3">{i.getValue()}</span>,
  }),
  col.accessor('proj', {
    header: 'Project',
    cell: i => <span className="text-xs text-text-2 whitespace-nowrap">{i.getValue()}</span>,
  }),
  col.accessor('bldg', {
    header: 'Building',
    cell: i => <span className="font-mono text-xs text-text font-medium">{i.getValue()}</span>,
  }),
  col.accessor('desc', {
    header: 'Description',
    enableSorting: false,
    cell: i => <span className="text-xs text-text-2 max-w-[200px] truncate block">{i.getValue()}</span>,
  }),
  col.accessor('cost', {
    header: 'Contract $',
    cell: i => (
      <span className="font-mono text-xs text-text-2 whitespace-nowrap">
        ${i.getValue().toLocaleString()}
      </span>
    ),
  }),
  col.accessor('pct', {
    header: 'Progress',
    cell: i => {
      const v = i.getValue()
      return (
        <div className="flex items-center gap-2">
          <div className="w-14 bg-bg rounded-full h-1 overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full"
              style={{ width: `${v * 100}%`, background: v === 1 ? '#0dd9c4' : '#3b82f6' }}
            />
          </div>
          <span className="font-mono text-[10px] text-text-3 w-8">{Math.round(v * 100)}%</span>
        </div>
      )
    },
  }),
  col.accessor('status', {
    header: 'Status',
    cell: i => <Badge variant={STATUS_BADGE_MAP[i.getValue()]}>{i.getValue()}</Badge>,
  }),
  col.accessor('remark', {
    header: 'Remark',
    enableSorting: false,
    cell: i => (
      <span className="text-xs text-text-3 max-w-[140px] truncate block">{i.getValue() ?? '—'}</span>
    ),
  }),
]

// ── Page component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 25

export default function OverviewPage() {
  const { buildings } = useProjectStore()

  // External filters (pre-filter before TanStack)
  const [search, setSearch]             = useState('')
  const [projFilter, setProjFilter]     = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // TanStack state
  const [sorting, setSorting]             = useState<SortingState>([{ id: 'n', desc: false }])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [colMenuOpen, setColMenuOpen]     = useState(false)
  const colMenuRef = useRef<HTMLDivElement>(null)

  // Close column menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false)
      }
    }
    if (colMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [colMenuOpen])

  const projects = useMemo(() => ['All', ...Array.from(new Set(buildings.map(b => b.proj)))], [buildings])
  const statuses = useMemo(() => ['All', ...Array.from(new Set(buildings.map(b => b.status)))], [buildings])

  // Pre-filtered data passed to TanStack
  const data = useMemo(() => {
    let rows = buildings
    if (projFilter !== 'All')   rows = rows.filter(b => b.proj === projFilter)
    if (statusFilter !== 'All') rows = rows.filter(b => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(b => b.bldg.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
    }
    return rows
  }, [buildings, projFilter, statusFilter, search])

  const table = useReactTable({
    data,
    columns: COLUMNS,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

  const { pageIndex } = table.getState().pagination
  const pageCount = table.getPageCount()
  const rows = table.getRowModel().rows
  const totalFiltered = data.length

  // Derive visible column count for display
  const hiddenCount = Object.values(columnVisibility).filter(v => v === false).length

  // Chart data derived from ALL buildings (not filtered)
  const donutData = useMemo(() => {
    const counts: Record<string, number> = {}
    buildings.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1 })
    const colorMap: Record<string, string> = {
      'Done': COLORS.teal, 'in progress': COLORS.blue,
      'Stopped': COLORS.red, 'Pending': COLORS.amber, 'Collaps': COLORS.violet,
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, color: colorMap[name] ?? COLORS.text2 }))
      .sort((a, b) => b.value - a.value)
  }, [buildings])

  const summaryMetrics = useMemo(() => {
    const done = buildings.filter(b => b.status === 'Done').length
    const delayed = buildings.filter(b => (b.delayDays ?? 0) > 0).length
    const totalCost = buildings.reduce((s, b) => s + b.cost, 0)
    const ev = buildings.reduce((s, b) => s + b.cost * b.pct, 0)
    const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`
    return { done, delayed, totalCost, ev, fmt }
  }, [buildings])

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Project Overview</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            {totalFiltered} of {buildings.length} buildings
          </p>
        </div>
      </div>

      {/* Summary charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card accent="teal">
          <p className="text-[10px] font-mono text-text-3 uppercase tracking-wider mb-1">Status Breakdown</p>
          <StatusDonut data={donutData} totalLabel="buildings" totalValue={buildings.length} height={180} />
        </Card>
        <Card accent="blue">
          <p className="text-[10px] font-mono text-text-3 uppercase tracking-wider mb-1">Progress Distribution</p>
          <ProgressHistogram buildings={buildings} height={160} />
        </Card>
        <div className="flex flex-col gap-3">
          <KpiCard label="Completed Buildings" value={summaryMetrics.done}
            sub={`${Math.round(summaryMetrics.done / buildings.length * 100)}% of total`}
            icon="✓" accent="green" />
          <KpiCard label="Delayed Buildings" value={summaryMetrics.delayed}
            sub="Buildings with delayDays > 0"
            icon="⚠" accent={summaryMetrics.delayed > 0 ? 'red' : 'neutral'} />
          <KpiCard label="Earned Value" value={summaryMetrics.fmt(summaryMetrics.ev)}
            sub={`of ${summaryMetrics.fmt(summaryMetrics.totalCost)} budget`}
            icon="◉" accent="amber" />
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search building / description…"
          value={search}
          onChange={e => { setSearch(e.target.value); table.setPageIndex(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 w-full sm:w-64 placeholder:text-text-3 font-body"
        />
        <select
          value={projFilter}
          onChange={e => { setProjFilter(e.target.value); table.setPageIndex(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 font-body"
        >
          {projects.map(p => <option key={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); table.setPageIndex(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 font-body"
        >
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>

        {(search || projFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setProjFilter('All'); setStatusFilter('All'); table.setPageIndex(0) }}
            className="text-xs text-text-3 hover:text-text transition-colors px-2 py-1.5 border border-border rounded-lg"
          >
            Clear
          </button>
        )}

        {/* Column visibility toggle */}
        <div ref={colMenuRef} className="relative ml-auto">
          <button
            onClick={() => setColMenuOpen(o => !o)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg transition-colors font-mono ${
              hiddenCount > 0
                ? 'border-teal/40 text-teal bg-teal/5'
                : 'border-border text-text-3 hover:text-text hover:border-teal/40'
            }`}
          >
            ⊞ Columns{hiddenCount > 0 && <span className="bg-teal/15 text-teal px-1 rounded text-[10px]">{hiddenCount} hidden</span>}
          </button>
          {colMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-xl p-3 min-w-[160px]">
              <p className="text-[10px] text-text-3 font-mono uppercase tracking-wider mb-2">Toggle columns</p>
              {table.getAllLeafColumns().map(col => (
                <label
                  key={col.id}
                  className="flex items-center gap-2 py-1 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="accent-teal"
                  />
                  <span className="text-xs text-text-2 group-hover:text-text transition-colors font-body capitalize">
                    {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                  </span>
                </label>
              ))}
              <button
                onClick={() => table.resetColumnVisibility()}
                className="mt-2 w-full text-[10px] text-text-3 hover:text-text transition-colors font-mono border-t border-border/60 pt-2"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface/40">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => {
                    const canSort = header.column.getCanSort()
                    const sorted  = header.column.getIsSorted()
                    return (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        className={`text-left px-3 py-2.5 font-head text-[11px] tracking-wider text-text-3 select-none ${
                          canSort ? 'cursor-pointer hover:text-text transition-colors' : ''
                        }`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-[10px] opacity-40">
                              {sorted === 'asc' ? ' ▲' : sorted === 'desc' ? ' ▼' : ' ⇅'}
                            </span>
                          )}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`border-b border-border/40 hover:bg-white/[0.02] transition-colors ${
                    i % 2 !== 0 ? 'bg-white/[0.01]' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-12 text-center text-text-3 text-sm">No buildings match your filters.</div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-xs text-text-3 flex-wrap gap-2">
          <span className="font-mono">
            Showing {pageIndex * PAGE_SIZE + 1}–{Math.min((pageIndex + 1) * PAGE_SIZE, totalFiltered)} of {totalFiltered}
          </span>
          <div className="flex gap-1 flex-wrap">
            <button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="px-3 py-1 border border-border rounded-md hover:border-teal/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => i).map(i => (
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                className={`px-3 py-1 border rounded-md transition-colors ${
                  i === pageIndex
                    ? 'border-teal/40 text-teal bg-teal/5'
                    : 'border-border hover:border-teal/40'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="px-3 py-1 border border-border rounded-md hover:border-teal/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
