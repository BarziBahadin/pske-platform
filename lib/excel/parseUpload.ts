import * as XLSX from 'xlsx'
import { z } from 'zod'
import type { Building, BuildingStatus } from '@/types/building'

// ── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES: BuildingStatus[] = ['Done', 'in progress', 'Stopped', 'Pending', 'Collaps']

/**
 * Maps Excel column headers (lowercased) → internal field names.
 * Add aliases here if customer renames their columns.
 */
const COL_MAP: Record<string, string> = {
  // Row number
  'n': 'n',   '#': 'n',   'no': 'n',   'no.': 'n',   'row': 'n',   'number': 'n',
  // Project
  'project': 'proj',   'proj': 'proj',   'project name': 'proj',
  // Description — note: Excel file uses "discription" (typo)
  'description': 'desc',   'desc': 'desc',   'discription': 'desc',   'type': 'desc',   'building type': 'desc',
  // Building code
  'building': 'bldg',   'bldg': 'bldg',   'unit': 'bldg',   'building code': 'bldg',   'code': 'bldg',
  // Cost
  'cost': 'cost',   'contract': 'cost',   'contract value': 'cost',   'value': 'cost',   'amount': 'cost',
  'grand total cost $': 'cost',   'grand total cost': 'cost',
  // Status
  'status': 'status',   'status of the work': 'status',
  // Progress %
  '%': 'pct',   'pct': 'pct',   'progress': 'pct',   'completion': 'pct',   'complete': 'pct',   '% complete': 'pct',
  'actual % complete current month': 'pct',   'actual % complete': 'pct',
  // Remark
  'remark': 'remark',   'remarks': 'remark',   'note': 'remark',   'notes': 'remark',   'comment': 'remark',
  // Zone / contractor
  'zone': 'zone',
  'contractor': 'contractor',
  // Dates — Excel "Start Date" / "Finish Date" map to planned schedule
  'planned start': 'plannedStart',   'start date': 'plannedStart',   'plan start': 'plannedStart',
  'planned end': 'plannedEnd',   'finish date': 'plannedEnd',   'end date': 'plannedEnd',
  'planned finish': 'plannedEnd',   'plan end': 'plannedEnd',
  'actual start': 'actualStart',   'act start': 'actualStart',
  'actual end': 'actualEnd',   'actual finish': 'actualEnd',   'act end': 'actualEnd',
  // Schedule metrics
  'original duration': 'originalDuration',   'duration': 'originalDuration',
  '% of duration remaining': 'durationPctRemaining',   'duration remaining': 'durationPctRemaining',
  '% of duration completed': 'durationPctCompleted',   'duration completed': 'durationPctCompleted',
  '(delay) day': 'delayDays',   'delay day': 'delayDays',   'delay days': 'delayDays',   'delay': 'delayDays',
  // Actual cost (AC) — enables real CPI calculation
  'actual cost': 'actualCost',   'ac': 'actualCost',   'actual expenditure': 'actualCost',
  'cost to date': 'actualCost',  'spent': 'actualCost', 'actual cost to date': 'actualCost',
}

// ── Zod schema ───────────────────────────────────────────────────────────────

const RawRowSchema = z.object({
  n:                   z.coerce.number().int().positive(),
  proj:                z.string().trim().min(1, 'Project name required'),
  desc:                z.string().trim().optional().default(''),
  bldg:                z.string().trim().min(1, 'Building code required'),
  cost:                z.coerce.number().nonnegative().default(0),
  status:              z.string().trim().min(1, 'Status required'),
  pct:                 z.coerce.number().min(0).default(0),
  remark:              z.string().trim().optional(),
  zone:                z.string().trim().optional(),
  contractor:          z.string().trim().optional(),
  plannedStart:        z.string().trim().optional(),
  plannedEnd:          z.string().trim().optional(),
  actualStart:         z.string().trim().optional(),
  actualEnd:           z.string().trim().optional(),
  originalDuration:    z.coerce.number().optional(),
  delayDays:           z.coerce.number().optional(),
  durationPctRemaining: z.coerce.number().min(0).optional(),
  durationPctCompleted: z.coerce.number().min(0).optional(),
  actualCost:           z.coerce.number().nonnegative().optional(),
})

// ── Types ────────────────────────────────────────────────────────────────────

export interface ParseError {
  row: number
  message: string
}

export interface DetectedColumn {
  original: string   // exact header from Excel
  mapped: string     // our internal field name (or '' if unrecognised)
}

export interface ParseResult {
  buildings: Building[]
  errors: ParseError[]
  totalRows: number
  skipped: number
  detectedColumns: DetectedColumn[]
}

// ── Helper ───────────────────────────────────────────────────────────────────

function normalizeRow(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(raw)) {
    const mapped = COL_MAP[key.toLowerCase().trim()]
    if (!mapped) continue
    // SheetJS with cellDates:true returns JS Date objects — convert to YYYY-MM-DD string
    out[mapped] = val instanceof Date
      ? val.toISOString().split('T')[0]
      : val
  }
  return out
}

/**
 * Excel stores % cells as decimals (0.94), but typed numbers might be 94.
 * Rule: if value > 1, treat as 0–100 range and divide by 100.
 */
function normalizePct(raw: number): number {
  return raw > 1 ? raw / 100 : raw
}

function normalizeStatus(raw: string): BuildingStatus {
  return VALID_STATUSES.find(s => s.toLowerCase() === raw.toLowerCase()) ?? 'Pending'
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Parses an Excel file ArrayBuffer into Building[].
 * Always reads the first sheet.
 * Returns both valid buildings and per-row errors so the UI can show a preview.
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

  // Collect column headers from first data row so the UI can show what was detected
  const detectedColumns: DetectedColumn[] = rawRows.length > 0
    ? Object.keys(rawRows[0]).map(key => ({
        original: key,
        mapped: COL_MAP[key.toLowerCase().trim()] ?? '',
      }))
    : []

  const buildings: Building[] = []
  const errors: ParseError[] = []

  for (let i = 0; i < rawRows.length; i++) {
    const rowNum = i + 2 // row 1 is header in Excel
    const normalized = normalizeRow(rawRows[i])

    // Skip completely empty rows (no bldg, no proj)
    if (!normalized.bldg && !normalized.proj) continue

    const result = RawRowSchema.safeParse(normalized)
    if (!result.success) {
      errors.push({
        row: rowNum,
        message: result.error.issues.map(issue => issue.message).join('; '),
      })
      continue
    }

    const d = result.data
    buildings.push({
      n:                    d.n,
      proj:                 d.proj,
      desc:                 d.desc,
      bldg:                 d.bldg,
      cost:                 d.cost,
      status:               normalizeStatus(d.status),
      pct:                  normalizePct(d.pct),
      remark:               d.remark || undefined,
      zone:                 d.zone || undefined,
      contractor:           d.contractor || undefined,
      plannedStart:         d.plannedStart || undefined,
      plannedEnd:           d.plannedEnd || undefined,
      actualStart:          d.actualStart || undefined,
      actualEnd:            d.actualEnd || undefined,
      originalDuration:     d.originalDuration ?? undefined,
      delayDays:            d.delayDays ?? undefined,
      durationPctRemaining: d.durationPctRemaining != null ? normalizePct(d.durationPctRemaining) : undefined,
      durationPctCompleted: d.durationPctCompleted != null ? normalizePct(d.durationPctCompleted) : undefined,
      actualCost:           d.actualCost ?? undefined,
    })
  }

  return {
    buildings,
    errors,
    totalRows: rawRows.length,
    skipped: rawRows.length - buildings.length - errors.length,
    detectedColumns,
  }
}
