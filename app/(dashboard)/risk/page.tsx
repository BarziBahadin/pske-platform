'use client'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import SectionHeader from '@/components/ui/SectionHeader'
import EmptyState from '@/components/ui/EmptyState'

const RISKS = [
  { id: 'R-001', title: 'Material supply delay — Rebar shortage', impact: 'High', prob: 'Medium', status: 'open', project: 'Florya City' },
  { id: 'R-002', title: 'Weather disruption — rainy season', impact: 'Medium', prob: 'High', status: 'open', project: 'Both' },
  { id: 'R-003', title: 'Contractor capacity constraint — Block B', impact: 'High', prob: 'Low', status: 'monitoring', project: 'Shary Daik' },
  { id: 'R-004', title: 'Permit delay — Phase 3 buildings', impact: 'High', prob: 'Medium', status: 'open', project: 'Florya City' },
  { id: 'R-005', title: 'Budget overrun — foundation variance', impact: 'Medium', prob: 'Medium', status: 'monitoring', project: 'Shary Daik' },
]

const IMPACT_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  High: 'stopped', Medium: 'pending', Low: 'neutral',
}
const STATUS_BADGE: Record<string, React.ComponentProps<typeof Badge>['variant']> = {
  open: 'stopped', monitoring: 'pending', closed: 'done',
}

export default function RiskPage() {
  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Schedule & Risk</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Risk register · Schedule variance · Delay analysis</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Open Risks', value: RISKS.filter(r => r.status === 'open').length.toString(), color: 'text-red-400' },
          { label: 'Monitoring', value: RISKS.filter(r => r.status === 'monitoring').length.toString(), color: 'text-amber-400' },
          { label: 'Closed', value: RISKS.filter(r => r.status === 'closed').length.toString(), color: 'text-teal' },
        ].map((k) => (
          <Card key={k.label}>
            <span className="text-[11px] text-text-3 uppercase tracking-wider font-body">{k.label}</span>
            <div className={`font-head text-3xl font-black mt-1 ${k.color}`}>{k.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Risk Register" subtitle="Active risks requiring attention" />
        <div className="space-y-0">
          {RISKS.map((risk) => (
            <div key={risk.id} className="flex items-center gap-3 py-3 border-b border-border/40 last:border-0">
              <span className="font-mono text-[10px] text-text-3 w-14">{risk.id}</span>
              <span className="flex-1 text-sm font-body text-text-2">{risk.title}</span>
              <span className="text-[10px] text-text-3 font-body w-24 text-right">{risk.project}</span>
              <Badge variant={IMPACT_BADGE[risk.impact]}>I: {risk.impact}</Badge>
              <Badge variant={IMPACT_BADGE[risk.prob]}>P: {risk.prob}</Badge>
              <Badge variant={STATUS_BADGE[risk.status]}>{risk.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Schedule Variance" subtitle="Delay analysis per building — Phase 2" />
        <EmptyState icon="▲" title="Delay analysis — Phase 2" description="Requires plannedEnd and actualEnd from Excel. Shows +/- days per building and overall delay trend." />
      </Card>
    </div>
  )
}
