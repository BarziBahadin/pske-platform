export interface NavRoute {
  id: string
  href: string
  label: string
  icon: string
  section: string
  badge?: string
  alert?: string
}

export const NAV_ROUTES: NavRoute[] = [
  { id: 'executive',   href: '/executive',   label: 'Executive Summary', icon: '◉', section: 'Executive' },
  { id: 'overview',    href: '/overview',    label: 'Project Overview',  icon: '▦', section: 'Operations', badge: '386' },
  { id: 'gantt',       href: '/gantt',       label: 'Gantt Schedule',    icon: '≡', section: 'Operations' },
  { id: 'engineering', href: '/engineering', label: 'Engineering',       icon: '⚙', section: 'Operations', alert: '12' },
  { id: 'field',       href: '/field',       label: 'Field Operations',  icon: '🔧', section: 'Operations' },
  { id: 'financial',   href: '/financial',   label: 'Financial',         icon: '$', section: 'Business' },
  { id: 'sales',       href: '/sales',       label: 'Sales & Marketing', icon: '◎', section: 'Business' },
  { id: 'risk',        href: '/risk',        label: 'Schedule & Risk',   icon: '▲', section: 'Business', alert: '5' },
  { id: 'upload',      href: '/upload',      label: 'Data Upload',       icon: '↑', section: 'Resources' },
  { id: 'documents',   href: '/documents',   label: 'Documents',         icon: '📁', section: 'Resources' },
  { id: 'settings',    href: '/settings',    label: 'Settings',          icon: '⚙', section: 'Resources' },
]
