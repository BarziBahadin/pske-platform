'use client'

import { useState, useRef } from 'react'
import { useProjectStore } from '@/lib/store/useProjectStore'
import {
  useFieldStore,
  type Defect,
  type DefectStatus,
  type DefectPriority,
} from '@/lib/store/useFieldStore'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'
import EmptyState from '@/components/ui/EmptyState'
import ExportPdfButton from '@/components/ui/ExportPdfButton'
import { COLORS } from '@/lib/constants/themeColors'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10)

const PRIORITY_COLOR: Record<DefectPriority, string> = {
  low: COLORS.teal, medium: COLORS.amber, high: COLORS.orange, critical: COLORS.red,
}
const PRIORITY_LABEL: Record<DefectPriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
}
const STATUS_BADGE: Record<DefectStatus, 'teal' | 'amber' | 'stopped' | 'neutral'> = {
  open: 'stopped', 'in-review': 'amber', resolved: 'teal', closed: 'neutral',
}
const STATUS_NEXT: Record<DefectStatus, DefectStatus | null> = {
  open: 'in-review', 'in-review': 'resolved', resolved: 'closed', closed: null,
}
const STATUS_LABEL: Record<DefectStatus, string> = {
  open: 'Open', 'in-review': 'In Review', resolved: 'Resolved', closed: 'Closed',
}

async function compressImage(file: File, maxPx = 900, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Photo Upload Form ─────────────────────────────────────────────────────────

interface PhotoFormState {
  description: string
  buildingN: string
  proj: string
  date: string
}

// ── Defect Add Form ───────────────────────────────────────────────────────────

interface DefectFormState {
  title: string
  description: string
  buildingN: string
  proj: string
  priority: DefectPriority
  reporter: string
  date: string
}

const DEFECT_FORM_INIT: DefectFormState = {
  title: '', description: '', buildingN: '', proj: 'Florya City',
  priority: 'medium', reporter: '', date: TODAY,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FieldPage() {
  const contentRef   = useRef<HTMLDivElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { buildings } = useProjectStore()
  const { photos, defects, addPhoto, removePhoto, addDefect, updateDefectStatus, removeDefect } = useFieldStore()

  // Photo form state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoCompressing, setPhotoCompressing] = useState(false)
  const [photoForm, setPhotoForm] = useState<PhotoFormState>({
    description: '', buildingN: '', proj: 'Florya City', date: TODAY,
  })

  // Defect form state
  const [showDefectForm, setShowDefectForm] = useState(false)
  const [defectForm, setDefectForm] = useState<DefectFormState>(DEFECT_FORM_INIT)
  const [defectFilter, setDefectFilter] = useState<'all' | DefectStatus>('all')

  // ── Photo handlers ───────────────────────────────────────────────────────

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoCompressing(true)
    try {
      const dataUrl = await compressImage(file)
      setPhotoPreview(dataUrl)
    } finally {
      setPhotoCompressing(false)
    }
    // reset input so same file can be re-selected
    e.target.value = ''
  }

  function handlePhotoSave() {
    if (!photoPreview || !photoForm.description.trim()) return
    const bN   = photoForm.buildingN ? parseInt(photoForm.buildingN) : null
    const bldg = bN ? (buildings.find((b) => b.n === bN)?.bldg ?? `B-${bN}`) : 'General'
    addPhoto({
      buildingN: bN, bldgLabel: bldg, proj: photoForm.proj,
      description: photoForm.description.trim(), date: photoForm.date, dataUrl: photoPreview,
    })
    setPhotoPreview(null)
    setPhotoForm({ description: '', buildingN: '', proj: 'Florya City', date: TODAY })
  }

  // ── Defect handlers ──────────────────────────────────────────────────────

  function handleDefectAdd() {
    if (!defectForm.title.trim()) return
    const bN   = defectForm.buildingN ? parseInt(defectForm.buildingN) : null
    const bldg = bN ? (buildings.find((b) => b.n === bN)?.bldg ?? `B-${bN}`) : 'General'
    addDefect({
      title: defectForm.title.trim(),
      description: defectForm.description.trim(),
      buildingN: bN, bldgLabel: bldg, proj: defectForm.proj,
      priority: defectForm.priority,
      reporter: defectForm.reporter.trim() || 'Unknown',
      date: defectForm.date,
      status: 'open',
    })
    setDefectForm(DEFECT_FORM_INIT)
    setShowDefectForm(false)
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const activeBuildings  = buildings.filter((b) => b.status === 'in progress').slice(0, 15)
  const openDefectCount  = defects.filter((d) => d.status === 'open').length
  const filteredDefects  = defectFilter === 'all' ? defects : defects.filter((d) => d.status === defectFilter)
  const defectCounts     = {
    all: defects.length,
    open: defects.filter(d => d.status === 'open').length,
    'in-review': defects.filter(d => d.status === 'in-review').length,
    resolved: defects.filter(d => d.status === 'resolved').length,
    closed: defects.filter(d => d.status === 'closed').length,
  }

  return (
    <div ref={contentRef} className="max-w-[1400px] space-y-4">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-head text-3xl font-black tracking-wide text-text">Field Operations</h1>
          <p className="text-xs text-text-3 mt-1 font-mono">
            Active sites · Photo log · Defect tracker
          </p>
        </div>
        <ExportPdfButton
          contentRef={contentRef}
          opts={{ title: 'Field Operations Report', filename: 'pske-field-report', orientation: 'portrait' }}
        />
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Sites"  value={buildings.filter(b => b.status === 'in progress').length} icon="🔧" accent="teal"    sub="Buildings in progress" />
        <KpiCard label="Stopped"       value={buildings.filter(b => b.status === 'Stopped').length}     icon="⛔" accent="red"     sub="Halted work" />
        <KpiCard label="Photo Logs"    value={photos.length}                                            icon="📷" accent="blue"   sub="Site photos captured" />
        <KpiCard label="Open Defects"  value={openDefectCount}                                          icon="⚠" accent={openDefectCount > 0 ? 'amber' : 'neutral'} sub="Require action" />
      </div>

      {/* ── Active Sites ──────────────────────────────────────────────── */}
      <Card>
        <SectionHeader title="Active Sites" subtitle={`${buildings.filter(b => b.status === 'in progress').length} buildings in progress`} />
        {activeBuildings.length === 0 ? (
          <EmptyState icon="🔧" title="No active buildings" />
        ) : (
          <div className="space-y-0">
            {activeBuildings.map((b) => (
              <div key={b.n} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
                <span className="font-mono text-[10px] text-text-3 w-8 flex-shrink-0">{b.n}</span>
                <span className="font-mono text-xs font-medium text-text w-20 flex-shrink-0">{b.bldg}</span>
                <span className="flex-1 text-xs text-text-2 font-body truncate">{b.desc}</span>
                <span className="font-mono text-[10px] text-text-3 flex-shrink-0">{b.proj === 'Florya City' ? 'FLR' : 'SHD'}</span>
                <div className="w-24 bg-bg rounded-full h-1.5 overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full bg-blue" style={{ width: `${b.pct * 100}%` }} />
                </div>
                <span className="font-mono text-[10px] text-text w-8 text-right flex-shrink-0">{Math.round(b.pct * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Photo Log ─────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader title="Photo Log" subtitle={`${photos.length} site photos`} />
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={photoCompressing || !!photoPreview}
            className="no-print text-xs font-mono px-3 py-1.5 bg-blue/10 text-blue border border-blue/20 rounded-lg
              hover:bg-blue/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {photoCompressing ? '⏳ Compressing…' : '📷 Add Photo'}
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* Photo add form */}
        {photoPreview && (
          <div className="mb-4 p-3 bg-surface rounded-lg border border-border/60 space-y-3">
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="preview" className="w-28 h-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Description (required)"
                  value={photoForm.description}
                  onChange={(e) => setPhotoForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-bg border border-border text-text text-xs px-3 py-1.5 rounded-lg font-body
                    placeholder:text-text-3 focus:outline-none focus:border-teal/50"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={photoForm.proj}
                    onChange={(e) => setPhotoForm(f => ({ ...f, proj: e.target.value, buildingN: '' }))}
                    className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                  >
                    <option value="Florya City">Florya City</option>
                    <option value="Shary Daik">Shary Daik</option>
                  </select>
                  <select
                    value={photoForm.buildingN}
                    onChange={(e) => setPhotoForm(f => ({ ...f, buildingN: e.target.value }))}
                    className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                  >
                    <option value="">General site</option>
                    {buildings
                      .filter(b => b.proj === photoForm.proj)
                      .map(b => (
                        <option key={b.n} value={b.n}>{b.bldg}</option>
                      ))
                    }
                  </select>
                  <input
                    type="date"
                    value={photoForm.date}
                    onChange={(e) => setPhotoForm(f => ({ ...f, date: e.target.value }))}
                    className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-teal/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setPhotoPreview(null)}
                className="text-xs font-mono px-3 py-1.5 border border-border text-text-3 rounded-lg hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoSave}
                disabled={!photoForm.description.trim()}
                className="text-xs font-mono px-3 py-1.5 bg-teal/10 text-teal border border-teal/20 rounded-lg
                  hover:bg-teal/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Photo
              </button>
            </div>
          </div>
        )}

        {/* Photo grid */}
        {photos.length === 0 ? (
          <EmptyState icon="📷" title="No photos yet" description="Click 'Add Photo' to capture site photos and link them to buildings." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative group rounded-lg overflow-hidden border border-border/60 bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.dataUrl} alt={p.description} className="w-full h-32 object-cover" />
                <div className="p-2 space-y-1">
                  <p className="text-[11px] text-text font-body leading-snug line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-teal">{p.bldgLabel}</span>
                    <span className="font-mono text-[9px] text-text-3">{p.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => removePhoto(p.id)}
                  className="no-print absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-bg/80 text-text-3 text-xs
                    hidden group-hover:flex items-center justify-center hover:text-red transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Defect Tracker ────────────────────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <SectionHeader title="Defect Tracker" subtitle="Quality issues & site defects" />
          <button
            onClick={() => setShowDefectForm((v) => !v)}
            className="no-print text-xs font-mono px-3 py-1.5 bg-amber-brand/10 text-amber-brand border border-amber-brand/20 rounded-lg
              hover:bg-amber-brand/15 transition-colors"
          >
            {showDefectForm ? '✕ Cancel' : '+ Add Defect'}
          </button>
        </div>

        {/* Add defect form */}
        {showDefectForm && (
          <div className="p-4 bg-surface/50 border-b border-border/60 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Defect title (required)"
                value={defectForm.title}
                onChange={(e) => setDefectForm(f => ({ ...f, title: e.target.value }))}
                className="bg-bg border border-border text-text text-xs px-3 py-1.5 rounded-lg font-body
                  placeholder:text-text-3 focus:outline-none focus:border-amber-brand/50 md:col-span-2"
              />
              <textarea
                placeholder="Description (optional)"
                value={defectForm.description}
                onChange={(e) => setDefectForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="bg-bg border border-border text-text text-xs px-3 py-1.5 rounded-lg font-body
                  placeholder:text-text-3 focus:outline-none focus:border-amber-brand/50 md:col-span-2 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={defectForm.proj}
                  onChange={(e) => setDefectForm(f => ({ ...f, proj: e.target.value, buildingN: '' }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-amber-brand/50"
                >
                  <option value="Florya City">Florya City</option>
                  <option value="Shary Daik">Shary Daik</option>
                </select>
                <select
                  value={defectForm.buildingN}
                  onChange={(e) => setDefectForm(f => ({ ...f, buildingN: e.target.value }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-amber-brand/50"
                >
                  <option value="">General site</option>
                  {buildings
                    .filter(b => b.proj === defectForm.proj)
                    .map(b => (
                      <option key={b.n} value={b.n}>{b.bldg}</option>
                    ))
                  }
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={defectForm.priority}
                  onChange={(e) => setDefectForm(f => ({ ...f, priority: e.target.value as DefectPriority }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-amber-brand/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <input
                  type="text"
                  placeholder="Reporter"
                  value={defectForm.reporter}
                  onChange={(e) => setDefectForm(f => ({ ...f, reporter: e.target.value }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono
                    placeholder:text-text-3 focus:outline-none focus:border-amber-brand/50"
                />
                <input
                  type="date"
                  value={defectForm.date}
                  onChange={(e) => setDefectForm(f => ({ ...f, date: e.target.value }))}
                  className="bg-bg border border-border text-text-2 text-xs px-2 py-1.5 rounded-lg font-mono focus:outline-none focus:border-amber-brand/50"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleDefectAdd}
                disabled={!defectForm.title.trim()}
                className="text-xs font-mono px-4 py-1.5 bg-amber-brand/10 text-amber-brand border border-amber-brand/20 rounded-lg
                  hover:bg-amber-brand/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Defect
              </button>
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-0 border-b border-border overflow-x-auto">
          {(['all', 'open', 'in-review', 'resolved', 'closed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDefectFilter(tab)}
              className={`no-print px-4 py-2.5 text-[11px] font-mono whitespace-nowrap border-b-2 transition-colors
                ${defectFilter === tab
                  ? 'border-teal text-teal'
                  : 'border-transparent text-text-3 hover:text-text-2'
                }`}
            >
              {tab === 'all' ? 'All' : STATUS_LABEL[tab]}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] ${defectFilter === tab ? 'bg-teal/15' : 'bg-white/5'}`}>
                {defectCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Defect list */}
        {filteredDefects.length === 0 ? (
          <div className="p-8 text-center text-text-3 text-xs font-mono">No defects in this category</div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredDefects.map((d: Defect) => (
              <div key={d.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface/30 transition-colors">
                {/* Priority indicator */}
                <div
                  className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
                  style={{ background: PRIORITY_COLOR[d.priority] }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[9px] text-text-3">{d.id}</span>
                    <span className="text-xs font-body font-medium text-text truncate">{d.title}</span>
                  </div>
                  {d.description && (
                    <p className="text-[11px] text-text-2 font-body mt-0.5 line-clamp-1">{d.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                      style={{ color: PRIORITY_COLOR[d.priority], background: `${PRIORITY_COLOR[d.priority]}18` }}
                    >
                      {PRIORITY_LABEL[d.priority]}
                    </span>
                    <span className="font-mono text-[9px] text-teal">{d.bldgLabel}</span>
                    <span className="font-mono text-[9px] text-text-3">{d.proj === 'Florya City' ? 'FLR' : 'SHD'}</span>
                    <span className="font-mono text-[9px] text-text-3">{d.date}</span>
                    {d.reporter && <span className="font-mono text-[9px] text-text-3">{d.reporter}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={STATUS_BADGE[d.status]}>{STATUS_LABEL[d.status]}</Badge>

                  {STATUS_NEXT[d.status] && (
                    <button
                      onClick={() => updateDefectStatus(d.id, STATUS_NEXT[d.status]!)}
                      className="no-print text-[9px] font-mono px-2 py-1 border border-border rounded text-text-3
                        hover:border-teal/40 hover:text-teal transition-colors whitespace-nowrap"
                    >
                      → {STATUS_LABEL[STATUS_NEXT[d.status]!]}
                    </button>
                  )}

                  <button
                    onClick={() => removeDefect(d.id)}
                    className="no-print text-[10px] text-text-3 hover:text-red transition-colors px-1"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
