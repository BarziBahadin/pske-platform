import { parseISO, format, differenceInDays, eachQuarterOfInterval } from 'date-fns'
import type { Building } from '@/types/building'

export interface GanttRow {
  bldg: string
  proj: string
  desc: string
  status: string
  pct: number
  plannedStart: Date
  plannedEnd: Date
  actualStart: Date
  plannedDays: number
  delayDays: number
  planOffsetPct: number   // left % of baseline (planned) bar
  planWidthPct: number    // width % of baseline (planned) bar
  actualOffsetPct: number // left % of actual bar — may differ from plan if actual start ≠ planned start
  actualWidthPct: number  // width % of actual bar
  delayWidthPct: number   // width % of delay overrun extension
}

export interface GanttDomain {
  start: Date
  end: Date
  todayPct: number
  quarters: Array<{ label: string; offsetPct: number }>
}

export interface GanttData {
  rows: GanttRow[]
  domain: GanttDomain
}

export function computeGantt(buildings: Building[]): GanttData | null {
  const withDates = buildings.filter(b => b.plannedStart && b.plannedEnd && b.actualStart)
  if (withDates.length === 0) return null

  const allDates = withDates.flatMap(b => [
    parseISO(b.plannedStart!),
    parseISO(b.plannedEnd!),
  ])

  const domainStart = new Date(Math.min(...allDates.map(d => d.getTime())))
  const domainEnd   = new Date(Math.max(...allDates.map(d => d.getTime())))
  const totalMs     = domainEnd.getTime() - domainStart.getTime()

  const pctOf = (d: Date) =>
    Math.min(100, Math.max(0, ((d.getTime() - domainStart.getTime()) / totalMs) * 100))
  const msToPct = (ms: number) =>
    Math.min(100, Math.max(0, (ms / totalMs) * 100))

  const today    = new Date()
  const todayPct = Math.round(pctOf(today) * 10000) / 10000

  const quarters = eachQuarterOfInterval({ start: domainStart, end: domainEnd }).map(q => ({
    label: format(q, "QQQ ''yy"),
    offsetPct: pctOf(q),
  }))

  const rows: GanttRow[] = withDates.map(b => {
    const ps  = parseISO(b.plannedStart!)
    const pe  = parseISO(b.plannedEnd!)
    const as_ = parseISO(b.actualStart!)
    const plannedDays = differenceInDays(pe, ps)
    const delayDays   = b.delayDays ?? 0
    const planMs      = pe.getTime() - ps.getTime()

    const planOffsetPct   = pctOf(ps)
    const planWidthPct    = msToPct(planMs)
    const actualOffsetPct = pctOf(as_)

    // Actual bar width: use actualEnd for Done buildings; otherwise estimate from pct of planned duration
    let actualWidthPct: number
    if (b.status === 'Done' && b.actualEnd) {
      const ae = parseISO(b.actualEnd)
      actualWidthPct = msToPct(ae.getTime() - as_.getTime())
    } else {
      actualWidthPct = msToPct(planMs * b.pct)
    }

    const delayWidthPct = delayDays > 0 ? msToPct(delayDays * 86_400_000) : 0

    return {
      bldg: b.bldg, proj: b.proj, desc: b.desc, status: b.status, pct: b.pct,
      plannedStart: ps, plannedEnd: pe, actualStart: as_,
      plannedDays, delayDays,
      planOffsetPct, planWidthPct,
      actualOffsetPct, actualWidthPct,
      delayWidthPct,
    }
  })

  rows.sort((a, b) => a.plannedStart.getTime() - b.plannedStart.getTime())

  return { rows, domain: { start: domainStart, end: domainEnd, todayPct, quarters } }
}

// Group rows by project then description
export function groupGanttRows(rows: GanttRow[]) {
  const projMap = new Map<string, Map<string, GanttRow[]>>()
  for (const row of rows) {
    if (!projMap.has(row.proj)) projMap.set(row.proj, new Map())
    const descMap = projMap.get(row.proj)!
    if (!descMap.has(row.desc)) descMap.set(row.desc, [])
    descMap.get(row.desc)!.push(row)
  }
  return Array.from(projMap.entries()).map(([proj, descMap]) => ({
    proj,
    groups: Array.from(descMap.entries()).map(([desc, rows]) => ({ desc, rows })),
  }))
}
