'use client'

import EmptyState from '@/components/ui/EmptyState'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

const OPEN_ITEMS = [
  { id: 'E-001', title: 'Foundation rebar spec update — Block C4', severity: 'high', status: 'open' },
  { id: 'E-002', title: 'Aluminium facade revision — Florya Tower A', severity: 'medium', status: 'in review' },
  { id: 'E-003', title: 'Structural report — Al-Nasir Row Houses', severity: 'low', status: 'open' },
  { id: 'E-004', title: 'MEP coordination clash — Building 12', severity: 'high', status: 'open' },
  { id: 'E-005', title: 'Soil test variance report', severity: 'medium', status: 'resolved' },
]

export default function EngineeringPage() {
  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Engineering</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Technical issues · RFIs · Drawing register</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open RFIs', value: '12', accent: 'text-red-400' },
          { label: 'In Review', value: '4', accent: 'text-amber-400' },
          { label: 'Resolved', value: '38', accent: 'text-teal' },
        ].map((k) => (
          <Card key={k.label} className="flex flex-col gap-1">
            <span className="text-[11px] text-text-3 uppercase tracking-wider font-body">{k.label}</span>
            <span className={`font-head text-3xl font-black ${k.accent}`}>{k.value}</span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4">
          <h2 className="font-head text-lg font-bold text-text">Open Engineering Items</h2>
          <p className="text-xs text-text-3 mt-0.5">Full RFI log and drawing tracker — Phase 2</p>
        </div>
        <div className="space-y-2">
          {OPEN_ITEMS.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
              <span className="font-mono text-[10px] text-text-3 w-14">{item.id}</span>
              <span className="flex-1 text-sm font-body text-text-2">{item.title}</span>
              <Badge variant={item.severity === 'high' ? 'stopped' : item.severity === 'medium' ? 'pending' : 'neutral'}>
                {item.severity}
              </Badge>
              <Badge variant={item.status === 'resolved' ? 'done' : item.status === 'in review' ? 'progress' : 'neutral'}>
                {item.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
