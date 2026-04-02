'use client'

import { useState } from 'react'
import { exportToPdf, type ExportOptions } from '@/lib/utils/exportPdf'

interface ExportPdfButtonProps {
  contentRef: React.RefObject<HTMLDivElement | null>
  opts: ExportOptions
  className?: string
}

export default function ExportPdfButton({ contentRef, opts, className = '' }: ExportPdfButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (!contentRef.current || loading) return
    setLoading(true)
    try {
      await exportToPdf(contentRef.current, opts)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`no-print flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border rounded-lg
        transition-colors font-mono
        ${loading
          ? 'border-teal/40 text-teal bg-teal/5 cursor-wait'
          : 'text-text-3 hover:text-text hover:border-teal/40'
        } ${className}`}
    >
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border border-teal border-t-transparent rounded-full animate-spin" />
          Generating…
        </>
      ) : (
        <>
          ↓ Export PDF
        </>
      )}
    </button>
  )
}
