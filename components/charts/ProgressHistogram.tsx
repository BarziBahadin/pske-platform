'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'

interface ProgressHistogramProps {
  buildings: Array<{ pct: number }>
  height?: number
}

const BUCKETS = [
  { label: '0–20%',   min: 0,    max: 0.2,  color: '#f04438' },
  { label: '20–40%',  min: 0.2,  max: 0.4,  color: '#fb923c' },
  { label: '40–60%',  min: 0.4,  max: 0.6,  color: '#f5a623' },
  { label: '60–80%',  min: 0.6,  max: 0.8,  color: '#a3e635' },
  { label: '80–99%',  min: 0.8,  max: 1.0,  color: '#22d3ee' },
  { label: '100%',    min: 1.0,  max: 1.01, color: '#0dd9c4' },
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; count: number; color: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-card border border-border rounded px-3 py-2 text-xs font-mono shadow-lg">
      <span className="text-text-2">{d.label}</span>
      <span className="font-bold ml-2" style={{ color: d.color }}>{d.count} buildings</span>
    </div>
  )
}

export default function ProgressHistogram({ buildings, height = 160 }: ProgressHistogramProps) {
  const data = BUCKETS.map(b => ({
    label: b.label,
    count: buildings.filter(bld => {
      if (b.max > 1) return bld.pct >= b.min
      if (b.min === 0) return bld.pct < b.max
      return bld.pct >= b.min && bld.pct < b.max
    }).length,
    color: b.color,
  }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0}>
        <BarChart data={data} margin={{ top: 18, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            tick={{ fill: '#4a5e78', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={36}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} fillOpacity={0.85} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
