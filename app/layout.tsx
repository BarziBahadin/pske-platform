import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'P-SKE Construction Intelligence Platform',
  description: 'Project Management Control Center — Florya City & Shary Daik',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800&family=Barlow:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text font-body min-h-screen overflow-x-hidden">
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#141c28',
              border: '1px solid #1e2d40',
              color: '#e2eaf5',
              fontFamily: 'Barlow, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
