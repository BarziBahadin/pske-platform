'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'
import EmptyState from '@/components/ui/EmptyState'

const MOCK_DOCS = [
  { id: 'D-001', title: 'Foundation Report — Florya City Phase 1', type: 'Report', date: '2025-03-10', size: '4.2 MB' },
  { id: 'D-002', title: 'Master Schedule Rev 5', type: 'Schedule', date: '2025-04-01', size: '1.1 MB' },
  { id: 'D-003', title: 'Structural Drawing Package — Block C', type: 'Drawing', date: '2025-04-15', size: '28 MB' },
  { id: 'D-004', title: 'Contractor Invoice — Q1 2025', type: 'Invoice', date: '2025-04-18', size: '0.8 MB' },
  { id: 'D-005', title: 'Soil Investigation Report — Shary Daik', type: 'Report', date: '2025-02-28', size: '6.3 MB' },
]

const TYPE_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  Report: 'teal', Schedule: 'progress', Drawing: 'amber', Invoice: 'pending', Contract: 'neutral',
}

export default function DocumentsPage() {
  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Documents</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">Reports · Drawings · Contracts · Invoices</p>
        </div>
        <button
          disabled
          className="text-xs font-body px-4 py-2 bg-teal/10 text-teal border border-teal/20 rounded-lg opacity-50 cursor-not-allowed"
        >
          + Upload — Phase 2
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Reports', value: '12', icon: '📋' },
          { label: 'Drawings', value: '48', icon: '📐' },
          { label: 'Contracts', value: '6', icon: '📄' },
          { label: 'Invoices', value: '31', icon: '🧾' },
        ].map((k) => (
          <Card key={k.label} className="flex items-center gap-3">
            <span className="text-xl">{k.icon}</span>
            <div>
              <p className="text-[10px] text-text-3 uppercase tracking-wider font-body">{k.label}</p>
              <p className="font-head text-xl font-bold text-text">{k.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader
          title="Recent Documents"
          subtitle="Latest uploads"
          action={
            <input
              type="text"
              placeholder="Search…"
              disabled
              className="bg-bg border border-border text-text-3 text-xs px-3 py-1.5 rounded-lg w-48 opacity-50 cursor-not-allowed"
            />
          }
        />
        <div className="space-y-0">
          {MOCK_DOCS.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
              <span className="font-mono text-[10px] text-text-3 w-14">{doc.id}</span>
              <span className="flex-1 text-sm font-body text-text-2">{doc.title}</span>
              <Badge variant={TYPE_BADGE[doc.type] ?? 'neutral'}>{doc.type}</Badge>
              <span className="font-mono text-[10px] text-text-3 w-16 text-right">{doc.size}</span>
              <span className="font-mono text-[10px] text-text-3 w-20 text-right">{doc.date}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Document Library" subtitle="Full DMS — Phase 2" />
        <EmptyState icon="📁" title="Full document library — Phase 2" description="Upload, tag, version-control, and link documents to buildings. PDF preview coming soon." />
      </Card>
    </div>
  )
}
