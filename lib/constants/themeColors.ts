export const COLORS = {
  teal:   '#0dd9c4',
  teal2:  '#08b5a2',
  amber:  '#f5a623',
  amber2: '#c87d10',
  red:    '#f04438',
  red2:   '#a41010',
  blue:   '#3b82f6',
  blue2:  '#1d4e8f',
  green:  '#22c55e',
  violet: '#a78bfa',
  pink:   '#f472b6',
  orange: '#fb923c',
  border: '#1e2d40',
  surface:'#111827',
  text2:  '#94a3b8',
  text3:  '#4a5e78',
} as const

export const STATUS_COLORS: Record<string, string> = {
  'Done':        COLORS.teal,
  'in progress': COLORS.blue,
  'Stopped':     COLORS.red,
  'Pending':     COLORS.amber,
  'Collaps':     COLORS.violet,
}
