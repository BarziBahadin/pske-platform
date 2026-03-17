import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Building } from '@/types/building'
import type { UploadSnapshot } from '@/types/snapshot'
import { SEED_BUILDINGS } from '@/lib/constants/seedData'

interface ProjectState {
  buildings: Building[]
  previousSnapshot: Building[]
  uploadHistory: UploadSnapshot[]
  lastUploadDate: string | null
  importBuildings: (buildings: Building[], date: string) => void
  resetToSeedData: () => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      buildings: SEED_BUILDINGS,
      previousSnapshot: [],
      uploadHistory: [],
      lastUploadDate: null,

      importBuildings: (buildings, date) => {
        const now = new Date().toISOString()
        const snapshot: UploadSnapshot = {
          id: now,
          uploadDate: date,
          label: date,
          buildingCount: buildings.length,
          buildings,
          computedAt: now,
        }
        set((s) => ({
          previousSnapshot: s.buildings,
          buildings,
          lastUploadDate: date,
          uploadHistory: [snapshot, ...s.uploadHistory].slice(0, 10),
        }))
      },

      resetToSeedData: () =>
        set({ buildings: SEED_BUILDINGS, previousSnapshot: [], uploadHistory: [], lastUploadDate: null }),
    }),
    { name: 'pske_project_v1' }
  )
)
