export type BuildingStatus = 'Done' | 'in progress' | 'Stopped' | 'Pending' | 'Collaps'
export type SalesStatus = 'Sold' | 'Reserved' | 'Available'

export interface Building {
  n: number
  proj: string
  desc: string
  bldg: string
  cost: number
  status: BuildingStatus
  pct: number        // 0 to 1
  remark?: string
  // Extended fields (from Excel upload)
  zone?: string
  contractor?: string
  plannedStart?: string
  plannedEnd?: string
  actualStart?: string
  actualEnd?: string
  originalDuration?: number   // Original Duration (days)
  delayDays?: number          // (Delay) Day — positive = behind, negative = ahead
  durationPctRemaining?: number  // % of Duration Remaining (0–1)
  durationPctCompleted?: number  // % of Duration Completed (0–1)
  salesStatus?: SalesStatus
  salePrice?: number
}
