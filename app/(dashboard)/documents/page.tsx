'use client'

import { useState, useRef, useMemo } from 'react'
import {
  useDocumentStore,
  type DocType,
  type DocProject,
  fmtBytes,
} from '@/lib/store/useDocumentStore'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'
import ExportPdfButton from '@/components/ui/ExportPdfButton'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10)

const TYPE_BADGE: Record<DocType, React.ComponentProps<typeof Badge>['variant']> = {
  Report: 'teal', Schedule: 'progress', Drawing: 'amber', Invoice: 'pending',
  Contract: 'collaps', Specification: 'neutral', Other: 'neutral',
}
const TYPE_ICON: Record<DocType, string> = {
  Report: '📋', Schedule: '📅', Drawing: '📐', Invoice: '🧾',
  Contract: '📄', Specification: '📝', Other: '📎',
}

const DOC_TYPES: DocType[] = ['Report', 'Drawing', 'Schedule', 'Invoice', 'Contract', 'Specification', 'Other']
const DOC_PROJECTS: DocProject[] = ['All', 'Florya City', 'Shary Daik']

interface UploadFormState {
  title: string
  type: DocType
  proj: DocProject
  date: string
  file: File | null
}

const UPLOAD_FORM_INIT: UploadFormState = {
  title: '', type: 'Report', proj: 'All', date: TODAY, file: null,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const contentRef   = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { documents, addDocument, removeDocument } = useDocumentStore()

  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadForm, setUploadForm] = useState<UploadFormState>(UPLOAD_FORM_INIT)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocType | 'All'>('All')
  const [projFilter, setProjFilter] = useState<DocProject | 'All'>('All')

  // ── Counts ───────────────────────────────────────────────────────────────

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const d of documents) counts[d.type] = (counts[d.type] ?? 0) + 1
    return counts
  }, [documents])

  // ── Filtered list ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = documents
    if (typeFilter !== 'All') list = list.filter(d => d.type === typeFilter)
    if (projFilter !== 'All') list = list.filter(d => d.proj === projFilter || d.proj === 'All')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      )
    }
    return list
  }, [documents, typeFilter, projFilter, search])

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadForm(f => ({
      ...f,
      file,
      title: f.title || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    }))
    e.target.value = ''
  }

  function handleUpload() {
    if (!uploadForm.file && !uploadForm.title.trim()) return
    addDocument({
      title: uploadForm.title.trim() || (uploadForm.file?.name ?? 'Untitled'),
      type: uploadForm.type,
      proj: uploadForm.proj,
      filename: uploadForm.file?.name ?? 'unknown',
      sizeBytes: uploadForm.file?.size ?? 0,
      date: uploadForm.date,
    })
    setUploadForm(UPLOAD_FORM_INIT)
    setShowUploadForm(false)
  }

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-4">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Documents</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            Reports · Drawings · Contracts · Invoices · {documents.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadForm(v => !v)}
            className="no-print text-xs font-mono px-3 py-1.5 bg-teal/10 text-teal border border-teal/20 rounded-lg
              hover:bg-teal/15 transition-colors"
          >
            {showUploadForm ? '✕ Cancel' : '📎 Register Document'}
          </button>
          <ExportPdfButton
            contentRef={contentRef}
            opts={{ title: 'Document Register', filename: 'pske-documents', orientation: 'portrait' }}
          />
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Reports"       value={typeCounts['Report']       ?? 0} icon="📋" accent="teal"    sub="Site + investigation reports" />
        <KpiCard label="Drawings"      value={typeCounts['Drawing']      ?? 0} icon="📐" accent="amber"   sub="Structural + MEP drawings" />
        <KpiCard label="Contracts"     value={typeCounts['Contract']     ?? 0} icon="📄" accent="violet"  sub="Agreements + subcontracts" />
        <KpiCard label="Invoices"      value={typeCounts['Invoice']      ?? 0} icon="🧾" accent="blue"    sub="Financial documents" />
      </div>

      {/* ── Upload form ───────────────────────────────────────────────── */}
      {showUploadForm && (
        <Card>
          <SectionHeader title="Register Document" subtitle="Add a document to the project register" />
          <div className="mt-3 space-y-3">
            {/* File picker */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-mono px-3 py-1.5 border border-border text-text-3 rounded-lg
                  hover:text-text hover:border-teal/40 transition-colors"
              >
                {uploadForm.file ? `📎 ${uploadForm.file.name}` : '📎 Select file…'}
              </button>
              {uploadForm.file && (
                <span className="text-[10px] font-mono text-text-3">{fmtBytes(uploadForm.file.size)}</span>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Document title (required)"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(f => ({ ...f, title: e.target.value }))}
                className="bg-bg border border-border text-text text-xs px-3 py-1.5 rounded-lg font-body
                  placeholder:text-text-3 focus:outline-none focus:border-teal/50 md:col-span-2"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm(f => ({ ...f, type: e.target.value as DocType }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                >
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={uploadForm.proj}
                  onChange={(e) => setUploadForm(f => ({ ...f, proj: e.target.value as DocProject }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                >
                  {DOC_PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  type="date"
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!uploadForm.title.trim() && !uploadForm.file}
                className="text-xs font-mono px-4 py-1.5 bg-teal/10 text-teal border border-teal/20 rounded-lg
                  hover:bg-teal/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Register
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Search + Filter bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search documents…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="no-print bg-card border border-border text-text text-xs px-3 py-1.5 rounded-lg font-body
            placeholder:text-text-3 focus:outline-none focus:border-teal/50 w-52"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as DocType | 'All')}
          className="no-print bg-card border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
        >
          <option value="All">All types</option>
          {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value as DocProject | 'All')}
          className="no-print bg-card border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
        >
          <option value="All">All projects</option>
          {DOC_PROJECTS.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {(typeFilter !== 'All' || projFilter !== 'All' || search) && (
          <button
            onClick={() => { setTypeFilter('All'); setProjFilter('All'); setSearch('') }}
            className="no-print text-[10px] font-mono text-text-3 hover:text-text transition-colors px-2 py-1.5"
          >
            Clear filters
          </button>
        )}
        <span className="text-[10px] font-mono text-text-3 ml-auto">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Document List ─────────────────────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 border-b border-border">
          <SectionHeader title="Document Register" subtitle="All registered documents" />
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-text-3 text-xs font-mono">
            {documents.length === 0 ? 'No documents registered yet' : 'No documents match the current filters'}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface/30 transition-colors">
                <span className="text-base flex-shrink-0">{TYPE_ICON[doc.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-body text-text truncate">{doc.title}</p>
                  <p className="text-[10px] font-mono text-text-3 mt-0.5 truncate">{doc.filename}</p>
                </div>
                <Badge variant={TYPE_BADGE[doc.type]}>{doc.type}</Badge>
                <span className="font-mono text-[10px] text-text-3 flex-shrink-0 hidden md:inline">
                  {doc.proj === 'All' ? 'All' : doc.proj === 'Florya City' ? 'FLR' : 'SHD'}
                </span>
                <span className="font-mono text-[10px] text-text-3 flex-shrink-0 hidden lg:inline">
                  {fmtBytes(doc.sizeBytes)}
                </span>
                <span className="font-mono text-[10px] text-text-3 flex-shrink-0">{doc.date}</span>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="no-print text-[10px] text-text-3 hover:text-red transition-colors px-1 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Type breakdown ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {DOC_TYPES.filter(t => (typeCounts[t] ?? 0) > 0).map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(typeFilter === t ? 'All' : t)}
            className={`no-print flex items-center gap-3 p-3 rounded-xl border transition-colors
              ${typeFilter === t ? 'border-teal/40 bg-teal/5' : 'border-border bg-card hover:border-border-2'}`}
          >
            <span className="text-lg">{TYPE_ICON[t]}</span>
            <div className="text-left">
              <p className="text-[10px] text-text-3 uppercase tracking-wider font-mono">{t}</p>
              <p className="font-head text-xl font-bold text-text">{typeCounts[t] ?? 0}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
