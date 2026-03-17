import TrendArrow from './TrendArrow'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: string
  trend?: number          // optional delta vs previous snapshot
  trendInvert?: boolean   // pass true when lower-is-better
  trendSuffix?: string
  accent?: 'teal' | 'amber' | 'red' | 'neutral'
  className?: string
}

const ACCENT_STYLES: Record<string, string> = {
  teal:    'border-teal/25 shadow-[0_0_20px_rgba(13,217,196,0.06)]',
  amber:   'border-[#f5a623]/25 shadow-[0_0_20px_rgba(245,166,35,0.06)]',
  red:     'border-red-400/25',
  neutral: 'border-border',
}

const ICON_BG: Record<string, string> = {
  teal:    'bg-teal/10',
  amber:   'bg-[#f5a623]/10',
  red:     'bg-red-400/10',
  neutral: 'bg-white/5',
}

export default function KpiCard({
  label,
  value,
  sub,
  icon,
  trend,
  trendInvert,
  trendSuffix,
  accent = 'neutral',
  className = '',
}: KpiCardProps) {
  return (
    <div className={`bg-card border ${ACCENT_STYLES[accent]} rounded-xl p-4 flex flex-col gap-2 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-body font-medium text-text-3 uppercase tracking-wider leading-snug">
          {label}
        </span>
        {icon && (
          <span className={`${ICON_BG[accent]} text-[15px] w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0`}>
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-1">
        <span className="font-head text-2xl font-extrabold tracking-tight text-text leading-none">
          {value}
        </span>
        {trend !== undefined && (
          <TrendArrow value={trend} invert={trendInvert} suffix={trendSuffix} />
        )}
      </div>

      {sub && <p className="text-[10px] text-text-3 font-body leading-snug">{sub}</p>}
    </div>
  )
}
