'use client'

import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import Badge from '@/components/ui/Badge'
import { useProjectStore } from '@/lib/store/useProjectStore'
import { parseExcelBuffer, type ParseResult } from '@/lib/excel/parseUpload'
import type { BuildingStatus } from '@/types/building'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<BuildingStatus, React.ComponentProps<typeof Badge>['variant']> = {
  Done:          'done',
  'in progress': 'progress',
  Stopped:       'stopped',
  Pending:       'pending',
  Collaps:       'collaps',
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

// ── Component ─────────────────────────────────────────────────────────────────

type Stage = 'idle' | 'parsed' | 'committed'

export default function UploadPage() {
  const { importBuildings, resetToSeedData, uploadHistory, lastUploadDate } = useProjectStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage]         = useState<Stage>('idle')
  const [dragging, setDragging]   = useState(false)
  const [filename, setFilename]   = useState('')
  const [result, setResult]       = useState<ParseResult | null>(null)

  // ── File processing ───────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Only .xlsx or .xls files are supported')
      return
    }
    setFilename(file.name)
    setStage('idle')
    setResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const parsed = parseExcelBuffer(buffer)
        setResult(parsed)
        setStage('parsed')
        if (parsed.errors.length > 0) {
          toast.warning(`Parsed ${parsed.buildings.length} buildings — ${parsed.errors.length} rows had errors`)
        } else {
          toast.success(`Parsed ${parsed.buildings.length} buildings successfully`)
        }
      } catch {
        toast.error('Failed to read file — make sure it is a valid Excel workbook')
      }
    }
    reader.readAsArrayBuffer(file)
  }, [])

  // ── Drag & drop handlers ──────────────────────────────────────────────────

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  // ── Commit ────────────────────────────────────────────────────────────────

  const handleCommit = () => {
    if (!result || result.buildings.length === 0) return
    const date = format(new Date(), 'MMM dd yyyy')
    importBuildings(result.buildings, date)
    setStage('committed')
    toast.success(`${result.buildings.length} buildings imported — dashboard updated`)
  }

  const handleReset = () => {
    resetToSeedData()
    setStage('idle')
    setResult(null)
    setFilename('')
    toast.info('Reverted to seed data')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Data Upload"
        subtitle="Import daily Excel report to update all 386 buildings"
        action={
          lastUploadDate
            ? <span className="text-[11px] text-text-3 font-mono">Last import: {lastUploadDate}</span>
            : undefined
        }
      />

      {/* ── Drop zone ─────────────────────────────────────────────────────── */}
      <Card padding="none">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-12 rounded-xl cursor-pointer
            border-2 border-dashed transition-colors
            ${dragging
              ? 'border-teal bg-teal/5'
              : 'border-border/60 hover:border-border hover:bg-surface/40'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={onFileChange}
          />
          <span className="text-3xl select-none">📊</span>
          <div className="text-center">
            <p className="text-text font-head font-semibold text-[15px]">
              {dragging ? 'Drop to import' : 'Drop Excel file here'}
            </p>
            <p className="text-text-3 text-[12px] mt-0.5">
              {filename
                ? <span className="text-teal font-mono">{filename}</span>
                : <>.xlsx or .xls · click to browse</>
              }
            </p>
          </div>
          {stage === 'committed' && (
            <span className="absolute top-3 right-3 text-[11px] text-teal font-mono bg-teal/10 border border-teal/20 px-2 py-0.5 rounded">
              Committed
            </span>
          )}
        </div>
      </Card>

      {/* ── Parse result ──────────────────────────────────────────────────── */}
      {result && stage === 'parsed' && (
        <>
          {/* ── Step 2 commit banner ──────────────────────────────────────── */}
          <div className={`rounded-xl border p-4 flex flex-wrap items-center gap-4 ${
            result.buildings.length > 0
              ? 'border-teal/30 bg-teal/5'
              : 'border-red/30 bg-red/5'
          }`}>
            <div className="flex gap-4 items-center flex-1">
              <span className={`font-head font-bold text-[32px] leading-none ${result.buildings.length > 0 ? 'text-teal' : 'text-red'}`}>
                {result.buildings.length}
              </span>
              <div>
                <p className="text-text font-semibold text-[14px]">
                  {result.buildings.length > 0 ? 'Buildings ready to import' : 'No buildings could be parsed'}
                </p>
                <p className="text-text-3 text-[12px] mt-0.5">
                  {result.totalRows} rows read · {result.errors.length} failed · {result.skipped} skipped
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setStage('idle'); setResult(null); setFilename('') }}
                className="px-4 py-2 text-[13px] text-text-2 border border-border rounded-lg hover:bg-surface transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleCommit}
                disabled={result.buildings.length === 0}
                className="px-5 py-2 text-[13px] font-bold bg-teal text-bg rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Commit to Dashboard →
              </button>
            </div>
          </div>

          {/* Detected columns */}
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <span className="text-[12px] text-text-2 font-head font-semibold tracking-wide uppercase">
                Detected Columns ({result.detectedColumns.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {result.detectedColumns.map((col) => (
                <span
                  key={col.original}
                  className={`text-[11px] font-mono px-2 py-1 rounded border ${
                    col.mapped
                      ? 'border-teal/30 bg-teal/5 text-teal'
                      : 'border-border/40 bg-surface/30 text-text-3'
                  }`}
                  title={col.mapped ? `→ ${col.mapped}` : 'Not recognised — will be ignored'}
                >
                  {col.original}{col.mapped ? ` → ${col.mapped}` : ''}
                </span>
              ))}
            </div>
          </Card>

          {/* Preview table */}
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <span className="text-[12px] text-text-2 font-head font-semibold tracking-wide uppercase">
                Preview — first 10 rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    {['#', 'Project', 'Building', 'Description', 'Cost', 'Status', '%'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-text-3 font-mono font-normal tracking-wide uppercase text-[10px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.buildings.slice(0, 10).map((b) => (
                    <tr key={b.n} className="border-b border-border/40 hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-text-3">{b.n}</td>
                      <td className="px-4 py-2.5 text-text-2">{b.proj}</td>
                      <td className="px-4 py-2.5 font-mono text-teal">{b.bldg}</td>
                      <td className="px-4 py-2.5 text-text-2">{b.desc}</td>
                      <td className="px-4 py-2.5 font-mono text-text-2">{fmt(b.cost)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={STATUS_VARIANT[b.status]}>{b.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-text">
                        {Math.round(b.pct * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.buildings.length > 10 && (
              <p className="px-4 py-2.5 text-[11px] text-text-3 border-t border-border/40">
                + {result.buildings.length - 10} more rows not shown
              </p>
            )}
          </Card>

          {/* Error list */}
          {result.errors.length > 0 && (
            <Card padding="none">
              <div className="p-4 border-b border-red/20 bg-red/5">
                <span className="text-[12px] text-red font-head font-semibold tracking-wide uppercase">
                  Row Errors ({result.errors.length})
                </span>
              </div>
              <div className="divide-y divide-border/40 max-h-48 overflow-y-auto">
                {result.errors.map((err) => (
                  <div key={err.row} className="flex gap-3 px-4 py-2.5 text-[12px]">
                    <span className="font-mono text-red shrink-0">Row {err.row}</span>
                    <span className="text-text-2">{err.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── Upload history ─────────────────────────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <span className="text-[12px] text-text-2 font-head font-semibold tracking-wide uppercase">
            Upload History
          </span>
          <button
            onClick={handleReset}
            className="text-[11px] text-text-3 hover:text-red transition-colors"
          >
            Reset to seed data
          </button>
        </div>
        {uploadHistory.length === 0 ? (
          <p className="px-4 py-6 text-[12px] text-text-3 text-center">No imports yet — using seed data</p>
        ) : (
          <div className="divide-y divide-border/40">
            {uploadHistory.map((snap) => (
              <div key={snap.id} className="flex items-center gap-4 px-4 py-3 text-[12px]">
                <span className="font-mono text-teal text-[11px]">{snap.label}</span>
                <span className="text-text-2">{snap.buildingCount} buildings</span>
                <span className="ml-auto text-text-3 font-mono text-[10px]">
                  {format(new Date(snap.computedAt), 'MMM dd · HH:mm')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
