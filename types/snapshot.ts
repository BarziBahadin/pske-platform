import type { Building } from './building'

export interface UploadSnapshot {
  id: string
  uploadDate: string    // ISO 8601
  label: string         // e.g. "Jun 23 2025"
  buildingCount: number
  buildings: Building[]
  computedAt: string
}
