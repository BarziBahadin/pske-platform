type BadgeVariant = 'done' | 'progress' | 'stopped' | 'pending' | 'collaps' | 'teal' | 'amber' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  done:     'bg-teal/10 text-teal border border-teal/20',
  progress: 'bg-blue-500/10 text-blue-400 border border-blue-400/20',
  stopped:  'bg-red-500/10 text-red-400 border border-red-400/20',
  pending:  'bg-amber-500/10 text-amber-400 border border-amber-400/20',
  collaps:  'bg-purple-500/10 text-purple-400 border border-purple-400/20',
  teal:     'bg-teal/10 text-teal border border-teal/20',
  amber:    'bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20',
  neutral:  'bg-white/5 text-text-2 border border-border',
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-[4px] leading-none ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
