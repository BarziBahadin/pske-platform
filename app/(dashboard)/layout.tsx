'use client'

import { useUIStore } from '@/lib/store/useUIStore'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { mobileOpen, closeMobile } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text font-body">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-5 md:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}
