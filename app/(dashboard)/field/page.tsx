'use client'

import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import { useMemo } from 'react'

export default function FieldPage() {
  const { buildings } = useProjectStore()

  const activeBuildings = useMemo(
    () => buildings.filter((b) => b.status === 'in progress').slice(0, 20),
    [buildings]
  )

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Field Operations</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Active site activities · Photo log · Defects</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Sites', value: buildings.filter(b => b.status === 'in progress').length, icon: '🔧' },
          { label: 'Stopped', value: buildings.filter(b => b.status === 'Stopped').length, icon: '⛔' },
          { label: 'Photo Logs', value: '—', icon: '📷' },
          { label: 'Open Defects', value: '—', icon: '⚠' },
        ].map((k) => (
          <Card key={k.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-3 uppercase tracking-wider font-body">{k.label}</span>
              <span className="text-base">{k.icon}</span>
            </div>
            <span className="font-head text-2xl font-black text-text">{k.value}</span>
          </Card>
        ))}
      </div>

      <Card>
        <SectionHeader title="Active Sites" subtitle="Buildings currently in progress" />
        {activeBuildings.length === 0 ? (
          <EmptyState icon="🔧" title="No active buildings" />
        ) : (
          <div className="space-y-1.5">
            {activeBuildings.map((b) => (
              <div key={b.n} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <span className="font-mono text-[10px] text-text-3 w-8">{b.n}</span>
                <span className="font-mono text-xs font-medium text-text w-20">{b.bldg}</span>
                <span className="flex-1 text-xs text-text-2 font-body truncate">{b.desc}</span>
                <div className="w-20 bg-bg rounded-full h-1 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${b.pct * 100}%` }} />
                </div>
                <span className="font-mono text-[10px] text-text-3 w-8">{Math.round(b.pct * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Photo Log" subtitle="Site photos — Phase 2" />
        <EmptyState icon="📷" title="Photo log coming in Phase 2" description="Upload daily site photos with GPS tags and link them to specific buildings." />
      </Card>
    </div>
  )
}
