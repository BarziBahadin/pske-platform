'use client'

import { useState, useMemo } from 'react'
import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'
import type { BuildingStatus } from '@/types/building'

const STATUS_BADGE_MAP: Record<BuildingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Done:          'done',
  'in progress': 'progress',
  Stopped:       'stopped',
  Pending:       'pending',
  Collaps:       'collaps',
}

type SortField = 'n' | 'proj' | 'bldg' | 'cost' | 'pct' | 'status'

export default function OverviewPage() {
  const { buildings } = useProjectStore()

  const [search, setSearch]           = useState('')
  const [projFilter, setProjFilter]   = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortField, setSortField]     = useState<SortField>('n')
  const [sortAsc, setSortAsc]         = useState(true)
  const [page, setPage]               = useState(0)
  const PAGE_SIZE = 25

  const projects  = useMemo(() => ['All', ...Array.from(new Set(buildings.map((b) => b.proj)))], [buildings])
  const statuses  = useMemo(() => ['All', ...Array.from(new Set(buildings.map((b) => b.status)))], [buildings])

  const filtered = useMemo(() => {
    let rows = buildings
    if (projFilter !== 'All')   rows = rows.filter((b) => b.proj === projFilter)
    if (statusFilter !== 'All') rows = rows.filter((b) => b.status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter((b) => b.bldg.toLowerCase().includes(q) || b.desc.toLowerCase().includes(q))
    }
    return [...rows].sort((a, b) => {
      const av = a[sortField] ?? 0
      const bv = b[sortField] ?? 0
      return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
    })
  }, [buildings, projFilter, statusFilter, search, sortField, sortAsc])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageRows   = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function toggleSort(field: SortField) {
    if (sortField === field) setSortAsc((a) => !a)
    else { setSortField(field); setSortAsc(true) }
    setPage(0)
  }

  const TH = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-3 py-2 font-head text-[11px] tracking-wider text-text-3 cursor-pointer hover:text-text select-none"
      onClick={() => toggleSort(field)}
    >
      {children}
      {sortField === field && <span className="ml-1 opacity-60">{sortAsc ? '▲' : '▼'}</span>}
    </th>
  )

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Project Overview</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">{filtered.length} of {buildings.length} buildings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search building / description…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 w-64 placeholder:text-text-3 font-body"
        />
        <select
          value={projFilter}
          onChange={(e) => { setProjFilter(e.target.value); setPage(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 font-body"
        >
          {projects.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="bg-card border border-border text-text text-sm px-3 py-1.5 rounded-lg outline-none focus:border-teal/40 font-body"
        >
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(search || projFilter !== 'All' || statusFilter !== 'All') && (
          <button
            onClick={() => { setSearch(''); setProjFilter('All'); setStatusFilter('All'); setPage(0) }}
            className="text-xs text-text-3 hover:text-text transition-colors px-2 py-1.5 border border-border rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <TH field="n">#</TH>
                <TH field="proj">Project</TH>
                <TH field="bldg">Building</TH>
                <th className="text-left px-3 py-2 font-head text-[11px] tracking-wider text-text-3">Description</th>
                <TH field="cost">Contract</TH>
                <TH field="pct">Progress</TH>
                <TH field="status">Status</TH>
                <th className="text-left px-3 py-2 font-head text-[11px] tracking-wider text-text-3">Remark</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((b, i) => (
                <tr key={b.n} className={`border-b border-border/40 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-3 py-2.5 font-mono text-xs text-text-3">{b.n}</td>
                  <td className="px-3 py-2.5 font-body text-xs text-text-2 whitespace-nowrap">{b.proj}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-text font-medium">{b.bldg}</td>
                  <td className="px-3 py-2.5 font-body text-xs text-text-2 max-w-[200px] truncate">{b.desc}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-text-2 whitespace-nowrap">
                    ${b.cost.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-bg rounded-full h-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${b.pct * 100}%`, background: b.pct === 1 ? '#0dd9c4' : '#3b82f6' }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-text-3 w-8">{Math.round(b.pct * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant={STATUS_BADGE_MAP[b.status]}>{b.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5 font-body text-xs text-text-3 max-w-[140px] truncate">{b.remark ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageRows.length === 0 && (
            <div className="py-12 text-center text-text-3 text-sm">No buildings match your filters.</div>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-3">
          <span className="font-mono">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-border rounded-md hover:border-teal/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i).map((i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`px-3 py-1 border rounded-md transition-colors ${
                  i === page ? 'border-teal/40 text-teal bg-teal/5' : 'border-border hover:border-teal/40'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
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
