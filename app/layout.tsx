import type { Metadata } from 'next'
import '@/styles/globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'P-SKE Construction Intelligence Platform',
  description: 'Project Management Control Center — Florya City & Shary Daik',
}

// Inlined before CSS loads to prevent flash of wrong theme
const themeScript = `
  try {
    const s = JSON.parse(localStorage.getItem('pske_ui_v1') || '{}')
    if ((s.state?.theme ?? 'dark') === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch(e) {
    document.documentElement.classList.add('dark')
  }
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text font-body min-h-screen overflow-x-hidden">
        {children}
        <ClientProviders />
      </body>
    </html>
  )
}
