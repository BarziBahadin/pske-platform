interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export default function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-4 ${className}`}>
      <div>
        <h2 className="font-head text-xl font-bold tracking-wide text-text leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-text-3 mt-0.5 font-body">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
