'use client'

interface ProgressRingProps {
  pct: number           // 0–100
  size?: number         // SVG dimensions (px)
  stroke?: number       // stroke width
  color?: string        // CSS color for progress arc
  label?: string        // center text override (defaults to pct%)
  className?: string
}

export default function ProgressRing({
  pct,
  size = 64,
  stroke = 5,
  color = '#0dd9c4',
  label,
  className = '',
}: ProgressRingProps) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(pct, 100) / 100) * circ

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e2d40" strokeWidth={stroke} />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-text leading-none">
        {label ?? `${Math.round(pct)}%`}
      </span>
    </div>
  )
}
