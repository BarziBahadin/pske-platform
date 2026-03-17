import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  glow?: boolean
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-6' }

export default function Card({ children, className = '', padding = 'md', glow = false }: CardProps) {
  return (
    <div
      className={`
        bg-card border border-border rounded-xl
        ${paddingMap[padding]}
        ${glow ? 'shadow-[0_0_24px_rgba(13,217,196,0.06)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
