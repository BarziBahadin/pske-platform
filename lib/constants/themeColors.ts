import { useUIStore } from '@/lib/store/useUIStore'

const DARK = {
  teal:   '#2563eb',
  teal2:  '#1d4ed8',
  amber:  '#f59e0b',
  amber2: '#d97706',
  red:    '#ef4444',
  red2:   '#b91c1c',
  blue:   '#60a5fa',
  blue2:  '#3b82f6',
  green:  '#22c55e',
  violet: '#a78bfa',
  pink:   '#f472b6',
  orange: '#fb923c',
  border: '#1e2d4a',
  surface:'#121a2b',
  card:   '#0e1525',
  text2:  '#94a3b8',
  text3:  '#4a6080',
} as const

const LIGHT = {
  teal:   '#2563eb',
  teal2:  '#1d4ed8',
  amber:  '#d97706',
  amber2: '#b45309',
  red:    '#dc2626',
  red2:   '#991b1b',
  blue:   '#3b82f6',
  blue2:  '#1d4ed8',
  green:  '#16a34a',
  violet: '#7c3aed',
  pink:   '#db2777',
  orange: '#ea580c',
  border: '#cbd5e1',
  surface:'#f8fafc',
  card:   '#ffffff',
  text2:  '#475569',
  text3:  '#94a3b8',
} as const

/** Use inside React components/hooks only */
export function useChartColors() {
  const theme = useUIStore((s) => s.theme)
  return theme === 'dark' ? DARK : LIGHT
}

/** Static fallback for non-reactive contexts (defaults to dark) */
export const COLORS = DARK

export const STATUS_COLORS: Record<string, string> = {
  'Done':        DARK.teal,
  'in progress': DARK.blue,
  'Stopped':     DARK.red,
  'Pending':     DARK.amber,
  'Collaps':     DARK.violet,
}
