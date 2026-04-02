import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DocType    = 'Report' | 'Drawing' | 'Schedule' | 'Invoice' | 'Contract' | 'Specification' | 'Other'
export type DocProject = 'Florya City' | 'Shary Daik' | 'All'

export interface DocumentEntry {
  id: string
  title: string
  type: DocType
  proj: DocProject
  filename: string
  sizeBytes: number
  date: string
  uploadedAt: string
}

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface DocumentState {
  documents: DocumentEntry[]
  addDocument: (doc: Omit<DocumentEntry, 'id' | 'uploadedAt'>) => void
  removeDocument: (id: string) => void
}

const SEED_DOCUMENTS: DocumentEntry[] = [
  { id: 'D-001', title: 'Foundation Report — Florya City Phase 1', type: 'Report',        proj: 'Florya City', filename: 'foundation-report-florya-p1.pdf',    sizeBytes: 4404019,  date: '2025-03-10', uploadedAt: '2025-03-10T10:00:00Z' },
  { id: 'D-002', title: 'Master Schedule Rev 5',                    type: 'Schedule',      proj: 'All',         filename: 'master-schedule-rev5.xlsx',           sizeBytes: 1153434,  date: '2025-04-01', uploadedAt: '2025-04-01T09:00:00Z' },
  { id: 'D-003', title: 'Structural Drawing Package — Block C',     type: 'Drawing',       proj: 'Florya City', filename: 'structural-drawings-block-c.pdf',      sizeBytes: 29360128, date: '2025-04-15', uploadedAt: '2025-04-15T14:00:00Z' },
  { id: 'D-004', title: 'Contractor Invoice — Q1 2025',             type: 'Invoice',       proj: 'Shary Daik',  filename: 'invoice-q1-2025.pdf',                 sizeBytes: 838861,   date: '2025-04-18', uploadedAt: '2025-04-18T11:00:00Z' },
  { id: 'D-005', title: 'Soil Investigation Report — Shary Daik',   type: 'Report',        proj: 'Shary Daik',  filename: 'soil-investigation-shary-daik.pdf',    sizeBytes: 6606028,  date: '2025-02-28', uploadedAt: '2025-02-28T08:00:00Z' },
  { id: 'D-006', title: 'Subcontractor Agreement — Electrical',      type: 'Contract',      proj: 'Florya City', filename: 'subcontract-electrical.pdf',           sizeBytes: 1258291,  date: '2025-01-15', uploadedAt: '2025-01-15T10:30:00Z' },
  { id: 'D-007', title: 'HVAC Technical Specification',              type: 'Specification', proj: 'Shary Daik',  filename: 'hvac-spec.pdf',                       sizeBytes: 2097152,  date: '2025-03-05', uploadedAt: '2025-03-05T09:00:00Z' },
]

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: SEED_DOCUMENTS,

      addDocument: (doc) =>
        set((s) => ({
          documents: [
            {
              ...doc,
              id: `D-${String(s.documents.length + 1).padStart(3, '0')}`,
              uploadedAt: new Date().toISOString(),
            },
            ...s.documents,
          ],
        })),

      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),
    }),
    { name: 'pske_docs_v1' }
  )
)
