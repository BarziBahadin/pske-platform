'use client'

import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import KpiCard from '@/components/ui/KpiCard'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import { useMemo } from 'react'

export default function SalesPage() {
  const { buildings } = useProjectStore()

  const metrics = useMemo(() => {
    const withSales = buildings.filter((b) => b.salesStatus)
    const sold      = withSales.filter((b) => b.salesStatus === 'Sold').length
    const reserved  = withSales.filter((b) => b.salesStatus === 'Reserved').length
    const available = withSales.filter((b) => b.salesStatus === 'Available').length
    const revenue   = buildings.reduce((s, b) => s + (b.salePrice ?? 0), 0)
    return { withSales: withSales.length, sold, reserved, available, revenue }
  }, [buildings])

  const hasSalesData = metrics.withSales > 0

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Sales & Marketing</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">Unit sales · Revenue · Availability</p>
      </div>

      {hasSalesData ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Units Sold" value={metrics.sold} icon="✓" accent="teal" />
            <KpiCard label="Reserved" value={metrics.reserved} icon="◎" accent="amber" />
            <KpiCard label="Available" value={metrics.available} icon="▦" accent="neutral" />
            <KpiCard
              label="Total Revenue"
              value={metrics.revenue >= 1e6 ? `$${(metrics.revenue / 1e6).toFixed(1)}M` : `$${(metrics.revenue / 1e3).toFixed(0)}K`}
              icon="$"
              accent="teal"
            />
          </div>
          <Card>
            <SectionHeader title="Sales Pipeline" subtitle="Detailed unit tracker — Phase 2" />
            <EmptyState icon="◎" title="Full pipeline in Phase 2" description="Sales funnel, unit detail, buyer tracking coming with extended Excel schema." />
          </Card>
        </>
      ) : (
        <Card>
          <EmptyState
            icon="◎"
            title="No sales data yet"
            description="Upload an Excel file with salesStatus and salePrice columns to populate this page."
          />
        </Card>
      )}
    </div>
  )
}
