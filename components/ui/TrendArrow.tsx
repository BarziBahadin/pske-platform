interface TrendArrowProps {
  value: number        // positive = up/good, negative = down/bad
  invert?: boolean     // when lower is better (e.g. delay days)
  suffix?: string
  className?: string
}

export default function TrendArrow({ value, invert = false, suffix = '', className = '' }: TrendArrowProps) {
  if (value === 0) {
    return <span className={`font-mono text-xs text-text-3 ${className}`}>—</span>
  }

  const isGood = invert ? value < 0 : value > 0
  const abs = Math.abs(value)
  const arrow = value > 0 ? '▲' : '▼'
  const color = isGood ? 'text-teal' : 'text-red-400'

  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-xs font-medium ${color} ${className}`}>
      {arrow}
      {abs}
      {suffix}
    </span>
  )
}
