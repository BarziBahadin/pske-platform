'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useUIStore } from '@/lib/store/useUIStore'

export default function ClientProviders() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Toaster
      theme={theme}
      toastOptions={{
        style: {
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text)',
          fontFamily: 'Barlow, sans-serif',
        },
      }}
    />
  )
}
