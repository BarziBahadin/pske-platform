import TrendArrow from './TrendArrow'

type Accent = 'teal' | 'amber' | 'red' | 'blue' | 'violet' | 'green' | 'neutral'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: string
  trend?: number
  trendInvert?: boolean
  trendSuffix?: string
  accent?: Accent
  className?: string
}

const TOP_BAR: Record<Accent, string> = {
  teal:    'bg-gradient-to-r from-teal to-teal/0',
  amber:   'bg-gradient-to-r from-amber-brand to-amber-brand/0',
  red:     'bg-gradient-to-r from-red to-red/0',
  blue:    'bg-gradient-to-r from-blue to-blue/0',
  violet:  'bg-gradient-to-r from-violet-brand to-violet-brand/0',
  green:   'bg-gradient-to-r from-green-brand to-green-brand/0',
  neutral: 'bg-gradient-to-r from-border to-border/0',
}

const CARD_BG: Record<Accent, string> = {
  teal:    'bg-gradient-to-br from-card via-card to-teal/[0.09]',
  amber:   'bg-gradient-to-br from-card via-card to-amber-brand/[0.10]',
  red:     'bg-gradient-to-br from-card via-card to-red/[0.08]',
  blue:    'bg-gradient-to-br from-card via-card to-blue/[0.08]',
  violet:  'bg-gradient-to-br from-card via-card to-violet-brand/[0.08]',
  green:   'bg-gradient-to-br from-card via-card to-green-brand/[0.08]',
  neutral: 'bg-card',
}

const BORDER_COLOR: Record<Accent, string> = {
  teal:    'border-teal/30',
  amber:   'border-amber-brand/30',
  red:     'border-red/30',
  blue:    'border-blue/30',
  violet:  'border-violet-brand/30',
  green:   'border-green-brand/30',
  neutral: 'border-border',
}

const GLOW: Record<Accent, string> = {
  teal:    'shadow-[0_2px_28px_rgba(13,217,196,0.12)]',
  amber:   'shadow-[0_2px_28px_rgba(245,166,35,0.12)]',
  red:     'shadow-[0_2px_28px_rgba(240,68,56,0.10)]',
  blue:    'shadow-[0_2px_28px_rgba(59,130,246,0.12)]',
  violet:  'shadow-[0_2px_28px_rgba(167,139,250,0.10)]',
  green:   'shadow-[0_2px_28px_rgba(34,197,94,0.10)]',
  neutral: '',
}

const VALUE_COLOR: Record<Accent, string> = {
  teal:    'text-teal',
  amber:   'text-amber-brand',
  red:     'text-red',
  blue:    'text-blue',
  violet:  'text-violet-brand',
  green:   'text-green-brand',
  neutral: 'text-text',
}

const ICON_RING: Record<Accent, string> = {
  teal:    'bg-teal/15 ring-1 ring-teal/30 text-teal',
  amber:   'bg-amber-brand/15 ring-1 ring-amber-brand/30 text-amber-brand',
  red:     'bg-red/15 ring-1 ring-red/30 text-red',
  blue:    'bg-blue/15 ring-1 ring-blue/30 text-blue',
  violet:  'bg-violet-brand/15 ring-1 ring-violet-brand/30 text-violet-brand',
  green:   'bg-green-brand/15 ring-1 ring-green-brand/30 text-green-brand',
  neutral: 'bg-white/5 ring-1 ring-white/10 text-text-3',
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
    <div
      className={`
        relative overflow-hidden rounded-xl border
        ${CARD_BG[accent]} ${BORDER_COLOR[accent]} ${GLOW[accent]}
        p-4 flex flex-col gap-2 ${className}
      `}
    >
      {/* Colored top stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${TOP_BAR[accent]}`} />

      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono font-medium text-text-3 uppercase tracking-[0.08em] leading-snug pt-0.5">
          {label}
        </span>
        {icon && (
          <span className={`text-[15px] w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${ICON_RING[accent]}`}>
            {icon}
          </span>
        )}
      </div>

      {/* Value + trend */}
      <div className="flex items-end justify-between gap-1">
        <span className={`font-head text-[26px] font-extrabold tracking-tight leading-none ${VALUE_COLOR[accent]}`}>
          {value}
        </span>
        {trend !== undefined && (
          <TrendArrow value={trend} invert={trendInvert} suffix={trendSuffix} />
        )}
      </div>

      {sub && (
        <p className="text-[10px] text-text-3 font-mono leading-snug">{sub}</p>
      )}
    </div>
  )
}
