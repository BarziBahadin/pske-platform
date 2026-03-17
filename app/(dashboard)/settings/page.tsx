'use client'

import { useConfigStore } from '@/lib/store/useConfigStore'
import { useProjectStore } from '@/lib/store/useProjectStore'
import Card from '@/components/ui/Card'
import SectionHeader from '@/components/ui/SectionHeader'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { config, resetConfig } = useConfigStore()
  const { buildings, lastUploadDate, resetToSeedData, uploadHistory } = useProjectStore()

  function handleReset() {
    resetToSeedData()
    toast.success('Data reset to seed (386 buildings)')
  }

  function handleResetConfig() {
    resetConfig()
    toast.success('Config reset to defaults')
  }

  return (
    <div className="max-w-[900px] space-y-4">
      <div>
        <h1 className="font-head text-3xl font-black tracking-wide text-text">Settings</h1>
        <p className="text-xs text-text-3 mt-1 font-mono">App configuration · Data management</p>
      </div>

      {/* Project Config */}
      <Card>
        <SectionHeader title="Projects" subtitle="Portfolio configuration" />
        <div className="space-y-3">
          {config.projects.map((proj) => (
            <div key={proj.id} className="p-3 bg-bg rounded-lg border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="font-head font-bold text-text">{proj.name}</span>
                <span className="font-mono text-[10px] text-text-3 bg-surface border border-border px-2 py-0.5 rounded">
                  {proj.code}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-3">Budget: </span>
                  <span className="font-mono text-text-2">${proj.totalBudget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-text-3">Target: </span>
                  <span className="font-mono text-text-2">{proj.plannedCompletion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-text-3 block">Currency</span>
              <span className="font-mono text-text-2">{config.reportingCurrency}</span>
            </div>
            <div>
              <span className="text-text-3 block">Portfolio Target</span>
              <span className="font-mono text-text-2">{config.portfolioTargetDate}</span>
            </div>
            <div>
              <span className="text-text-3 block">Data Refresh</span>
              <span className="font-mono text-text-2">{config.dataRefreshLabel}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleResetConfig}
          className="mt-4 text-xs text-text-3 hover:text-text border border-border hover:border-teal/30 px-3 py-1.5 rounded-lg transition-colors"
        >
          Reset config to defaults
        </button>
      </Card>

      {/* Data Management */}
      <Card>
        <SectionHeader title="Data Management" subtitle="Building data & upload history" />
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-text-3">Current buildings</span>
            <span className="font-mono text-text-2">{buildings.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-3">Last upload date</span>
            <span className="font-mono text-text-2">{lastUploadDate ?? 'Seed data (no upload yet)'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-3">Upload history</span>
            <span className="font-mono text-text-2">{uploadHistory.length} snapshots</span>
          </div>
        </div>

        {uploadHistory.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <p className="text-[11px] text-text-3 uppercase tracking-wider">Upload History</p>
            {uploadHistory.map((s) => (
              <div key={s.id} className="flex justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                <span className="text-text-2">{s.label}</span>
                <span className="font-mono text-text-3">{s.buildingCount} buildings</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleReset}
          className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
        >
          Reset data to seed (386 buildings)
        </button>
      </Card>

      {/* About */}
      <Card>
        <SectionHeader title="About" />
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-text-3">Platform</span>
            <span className="font-mono text-text-2">P-SKE Construction Intelligence</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-3">Stack</span>
            <span className="font-mono text-text-2">Next.js 15 · TypeScript · Tailwind CSS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-3">Data</span>
            <span className="font-mono text-text-2">Zustand + localStorage persist</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
