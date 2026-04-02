import { type ReactNode } from 'react'

type CardAccent = 'teal' | 'amber' | 'red' | 'blue' | 'violet' | 'none'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: boolean
  accent?: CardAccent
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

const ACCENT_STRIPE: Record<CardAccent, string> = {
  teal:   'bg-gradient-to-r from-teal/60 to-teal/0',
  amber:  'bg-gradient-to-r from-amber-brand/60 to-amber-brand/0',
  red:    'bg-gradient-to-r from-red/60 to-red/0',
  blue:   'bg-gradient-to-r from-blue/60 to-blue/0',
  violet: 'bg-gradient-to-r from-violet-brand/60 to-violet-brand/0',
  none:   '',
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  glow = false,
  accent,
}: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-card border border-border rounded-xl
        ${paddingMap[padding]}
        ${glow ? 'shadow-[0_0_28px_rgba(13,217,196,0.08)]' : ''}
        ${className}
      `}
    >
      {accent && accent !== 'none' && (
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${ACCENT_STRIPE[accent]}`} />
      )}
      {children}
    </div>
  )
}
