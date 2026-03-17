'use client'

import EmptyState from '@/components/ui/EmptyState'
import Card from '@/components/ui/Card'

export default function GanttPage() {
  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Gantt Schedule</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Construction timeline · Florya City & Shary Daik</p>
      </div>
      <Card>
        <EmptyState
          icon="≡"
          title="Gantt Chart — Phase 2"
          description="Interactive Gantt chart with planned vs actual bars per building. Requires plannedStart / plannedEnd / actualStart / actualEnd fields from Excel upload."
        />
      </Card>
    </div>
  )
}
