import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppConfig } from '@/types/config'

const DEFAULT_CONFIG: AppConfig = {
  projects: [
    {
      id: 'florya',
      name: 'Florya City',
      code: 'FC',
      color: 'teal',
      totalBudget: 127_000_000,
      plannedCompletion: '2026-12-31',
    },
    {
      id: 'shary',
      name: 'Shary Daik',
      code: 'SD',
      color: 'amber-brand',
      totalBudget: 83_700_000,
      plannedCompletion: '2027-03-31',
    },
  ],
  reportingCurrency: 'USD',
  portfolioTargetProgress: 100,
  portfolioTargetDate: '2027-03-31',
  dataRefreshLabel: '06:00 AM',
}

interface ConfigState {
  config: AppConfig
  updateConfig: (patch: Partial<AppConfig>) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      updateConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    { name: 'pske_config_v1' }
  )
)
