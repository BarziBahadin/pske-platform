import type { Building } from '@/types/building'
import type { UploadSnapshot } from '@/types/snapshot'

export interface SCurvePoint {
  date: string    // display label
  actual: number  // 0–100, weighted by cost
  planned?: number // 0–100, linear interpolation from building dates
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function weightedAvgPct(buildings: Building[]): number {
  const totalCost = buildings.reduce((s, b) => s + b.cost, 0)
  if (totalCost === 0) {
    return buildings.length
      ? (buildings.reduce((s, b) => s + b.pct, 0) / buildings.length) * 100
      : 0
  }
  return (buildings.reduce((s, b) => s + b.pct * b.cost, 0) / totalCost) * 100
}

/**
 * Computes planned % at a given date by linearly interpolating between
 * the earliest plannedStart and latest plannedEnd across all buildings.
 * Returns undefined if buildings lack date data.
 */
function computePlannedPct(
  buildings: Building[],
  atDate: Date,
  projectStart: Date,
  projectEnd: Date,
): number {
  const range = projectEnd.getTime() - projectStart.getTime()
  if (range <= 0) return 100
  const elapsed = atDate.getTime() - projectStart.getTime()
  return Math.min(100, Math.max(0, (elapsed / range) * 100))
}

function parseDate(s: string | undefined): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Builds an S-curve dataset from upload history + current buildings.
 * History is stored newest-first; this function reverses to oldest-first for charting.
 */
export function computeSCurve(
  currentBuildings: Building[],
  currentDate: string | null,
  history: UploadSnapshot[],
): SCurvePoint[] {
  // Determine project date range (for planned line)
  const allBuildings = currentBuildings.length ? currentBuildings
    : history.length ? history[0].buildings : []

  const starts = allBuildings.map(b => parseDate(b.plannedStart)).filter(Boolean) as Date[]
  const ends   = allBuildings.map(b => parseDate(b.plannedEnd)).filter(Boolean) as Date[]
  const projectStart = starts.length ? new Date(Math.min(...starts.map(d => d.getTime()))) : null
  const projectEnd   = ends.length   ? new Date(Math.max(...ends.map(d => d.getTime())))   : null
  const hasPlanned   = projectStart !== null && projectEnd !== null

  const points: SCurvePoint[] = []

  // History is newest-first — reverse for chronological order
  const sorted = [...history].reverse()
  for (const snap of sorted) {
    const actual = Math.round(weightedAvgPct(snap.buildings) * 10) / 10
    const pt: SCurvePoint = { date: snap.label, actual }
    if (hasPlanned) {
      const d = parseDate(snap.uploadDate) ?? parseDate(snap.computedAt)
      if (d) pt.planned = Math.round(computePlannedPct(snap.buildings, d, projectStart!, projectEnd!) * 10) / 10
    }
    points.push(pt)
  }

  // Add current point
  if (currentBuildings.length > 0) {
    const actual  = Math.round(weightedAvgPct(currentBuildings) * 10) / 10
    const label   = currentDate ?? 'Current'
    const last    = points[points.length - 1]
    const pt: SCurvePoint = { date: label, actual }
    if (hasPlanned) {
      const today = new Date()
      pt.planned = Math.round(computePlannedPct(currentBuildings, today, projectStart!, projectEnd!) * 10) / 10
    }
    if (!last || last.date !== label) {
      points.push(pt)
    } else {
      points[points.length - 1] = pt
    }
  }

  return points
}

// ── Delta helpers ─────────────────────────────────────────────────────────────

export interface BuildingDelta {
  bldg:       string
  proj:       string
  prevPct:    number  // 0–100
  currPct:    number  // 0–100
  delta:      number  // signed, pp
  prevStatus: string
  currStatus: string
}

/**
 * Compares currentBuildings vs previousSnapshot and returns buildings
 * where pct or status changed, sorted by |delta| descending.
 */
export function computeDeltas(
  current: Building[],
  previous: Building[],
): BuildingDelta[] {
  if (!previous.length) return []

  const prevMap = new Map(previous.map(b => [b.bldg, b]))
  const deltas: BuildingDelta[] = []

  for (const b of current) {
    const prev = prevMap.get(b.bldg)
    if (!prev) continue
    const currPct = Math.round(b.pct * 100)
    const prevPct = Math.round(prev.pct * 100)
    if (currPct !== prevPct || b.status !== prev.status) {
      deltas.push({
        bldg:       b.bldg,
        proj:       b.proj,
        prevPct,
        currPct,
        delta:      currPct - prevPct,
        prevStatus: prev.status,
        currStatus: b.status,
      })
    }
  }

  return deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}
