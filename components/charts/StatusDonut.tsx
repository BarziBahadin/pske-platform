'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface StatusDonutProps {
  data: Array<{ name: string; value: number; color: string }>
  totalLabel?: string
  totalValue?: string | number
  height?: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <span style={{ color: d.payload.color }}>{d.name}</span>
      <span className="text-text-2 ml-2 font-bold">{d.value}</span>
    </div>
  )
}

export default function StatusDonut({
  data,
  totalLabel = 'total',
  totalValue,
  height = 200,
}: StatusDonutProps) {
  const total = totalValue ?? data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="40%"
            cy="50%"
            innerRadius="52%"
            outerRadius="72%"
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ left: '0%', width: '80%' }}>
        <span className="font-head text-3xl font-extrabold text-text leading-none">{total}</span>
        <span className="text-[10px] text-text-3 font-mono mt-0.5 uppercase tracking-wider">{totalLabel}</span>
      </div>

      {/* Legend */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pr-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[10px] font-mono text-text-3 whitespace-nowrap">{d.name}</span>
            <span className="text-[10px] font-mono font-bold ml-auto pl-2" style={{ color: d.color }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
