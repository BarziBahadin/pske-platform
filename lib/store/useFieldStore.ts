import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefectStatus   = 'open' | 'in-review' | 'resolved' | 'closed'
export type DefectPriority = 'low' | 'medium' | 'high' | 'critical'

export interface PhotoEntry {
  id: string
  buildingN: number | null
  bldgLabel: string
  proj: string
  description: string
  date: string
  dataUrl: string
  uploadedAt: string
}

export interface Defect {
  id: string
  buildingN: number | null
  bldgLabel: string
  proj: string
  title: string
  description: string
  status: DefectStatus
  priority: DefectPriority
  date: string
  resolvedDate?: string
  reporter: string
}

interface FieldState {
  photos: PhotoEntry[]
  defects: Defect[]
  addPhoto: (photo: Omit<PhotoEntry, 'id' | 'uploadedAt'>) => void
  removePhoto: (id: string) => void
  addDefect: (defect: Omit<Defect, 'id'>) => void
  updateDefectStatus: (id: string, status: DefectStatus) => void
  removeDefect: (id: string) => void
}

const SEED_DEFECTS: Defect[] = [
  {
    id: 'DEF-001', buildingN: 7, bldgLabel: 'B-007', proj: 'Florya City',
    title: 'Concrete crack — foundation slab',
    description: 'Hairline crack 2.3m length on NW corner foundation slab, requires epoxy injection.',
    status: 'open', priority: 'high', date: '2025-04-10', reporter: 'Site Engineer A',
  },
  {
    id: 'DEF-002', buildingN: 12, bldgLabel: 'B-012', proj: 'Florya City',
    title: 'Water infiltration — basement level',
    description: 'Water seepage through construction joint on east wall, 1.5m section.',
    status: 'in-review', priority: 'critical', date: '2025-04-08', reporter: 'QC Inspector',
  },
  {
    id: 'DEF-003', buildingN: null, bldgLabel: 'General', proj: 'Shary Daik',
    title: 'Site drainage blockage — Zone C',
    description: 'Storm drain in Zone C partially blocked, causing water pooling near access road.',
    status: 'resolved', priority: 'medium', date: '2025-03-22', resolvedDate: '2025-04-02', reporter: 'Field Supervisor',
  },
  {
    id: 'DEF-004', buildingN: 3, bldgLabel: 'B-003', proj: 'Shary Daik',
    title: 'Rebar misalignment — column C4',
    description: 'Column C4 rebar cage deviated 35mm from drawing spec, flagged before pour.',
    status: 'resolved', priority: 'high', date: '2025-03-30', resolvedDate: '2025-04-05', reporter: 'Structural Engineer',
  },
  {
    id: 'DEF-005', buildingN: 15, bldgLabel: 'B-015', proj: 'Florya City',
    title: 'MEP coordination clash — Level 3',
    description: 'HVAC duct clashing with structural beam at grid intersection D-7, Level 3.',
    status: 'open', priority: 'medium', date: '2025-04-12', reporter: 'MEP Coordinator',
  },
]

export const useFieldStore = create<FieldState>()(
  persist(
    (set) => ({
      photos: [],
      defects: SEED_DEFECTS,

      addPhoto: (photo) =>
        set((s) => ({
          photos: [
            { ...photo, id: `PHT-${Date.now()}`, uploadedAt: new Date().toISOString() },
            ...s.photos,
          ],
        })),

      removePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      addDefect: (defect) =>
        set((s) => ({
          defects: [
            { ...defect, id: `DEF-${Date.now()}` },
            ...s.defects,
          ],
        })),

      updateDefectStatus: (id, status) =>
        set((s) => ({
          defects: s.defects.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status,
                  resolvedDate:
                    status === 'resolved' || status === 'closed'
                      ? new Date().toISOString().slice(0, 10)
                      : d.resolvedDate,
                }
              : d
          ),
        })),

      removeDefect: (id) =>
        set((s) => ({ defects: s.defects.filter((d) => d.id !== id) })),
    }),
    { name: 'pske_field_v1' }
  )
)
