import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  mobileOpen: boolean
  alertCount: number
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  openMobile: () => void
  closeMobile: () => void
  setAlertCount: (n: number) => void
  toggleTheme: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileOpen: false,
      alertCount: 3,
      theme: 'dark',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      openMobile:    () => set({ mobileOpen: true }),
      closeMobile:   () => set({ mobileOpen: false }),
      setAlertCount: (n) => set({ alertCount: n }),
      toggleTheme:   () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'pske_ui_v1',
      partialize: (s) => ({ theme: s.theme }),
    }
  )
)
