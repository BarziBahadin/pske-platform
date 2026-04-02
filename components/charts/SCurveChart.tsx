'use client'

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts'
import type { SCurvePoint } from '@/lib/derived/computeSCurve'
import { useChartColors, COLORS } from '@/lib/constants/themeColors'

interface Props {
  data: SCurvePoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-[12px] shadow-lg">
      <p className="font-mono text-text-3 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-mono">
          {entry.name}: <span className="font-bold">{entry.value?.toFixed(1)}%</span>
        </p>
      ))}
    </div>
  )
}

export default function SCurveChart({ data }: Props) {
  const C = useChartColors()
  const hasPlanned = data.some(d => d.planned !== undefined)
  const hasMultiple = data.length > 1

  return (
    <ResponsiveContainer width="100%" height={240} minWidth={0}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={C.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: C.text3, fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={{ stroke: C.border }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: C.text3, fontSize: 10, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        {(hasPlanned || hasMultiple) && (
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: C.text2 }}
            iconType="circle"
            iconSize={6}
          />
        )}

        {/* Planned baseline — dashed line */}
        {hasPlanned && (
          <Line
            type="monotone"
            dataKey="planned"
            name="Planned"
            stroke={COLORS.amber}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 3, fill: COLORS.amber }}
          />
        )}

        {/* Actual progress — filled area */}
        <Area
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke={COLORS.teal}
          strokeWidth={2}
          fill={COLORS.teal}
          fillOpacity={0.08}
          dot={hasMultiple
            ? { r: 3, fill: COLORS.teal, stroke: COLORS.teal }
            : { r: 5, fill: COLORS.teal, stroke: COLORS.teal, strokeWidth: 2 }
          }
          activeDot={{ r: 5, fill: COLORS.teal }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
