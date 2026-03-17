import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  mobileOpen: boolean
  alertCount: number
  toggleSidebar: () => void
  openMobile: () => void
  closeMobile: () => void
  setAlertCount: (n: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileOpen: false,
  alertCount: 0,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openMobile:  () => set({ mobileOpen: true }),
  closeMobile: () => set({ mobileOpen: false }),
  setAlertCount: (n) => set({ alertCount: n }),
}))
