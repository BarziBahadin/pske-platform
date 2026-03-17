# P-SKE Construction Intelligence Platform

A professional construction project management control center built with Next.js 16, TypeScript, and Tailwind CSS. Tracks **386 buildings** across two major projects — **Florya City** and **Shary Daik** — with support for daily Excel uploads to drive all data dynamically.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Design System](#design-system)
6. [Data Architecture](#data-architecture)
7. [Pages & Features](#pages--features)
8. [Zustand Stores](#zustand-stores)
9. [UI Components](#ui-components)
10. [Phase Roadmap](#phase-roadmap)
11. [Excel Upload Schema (Phase 2)](#excel-upload-schema-phase-2)
12. [Contributing](#contributing)

---

## Overview

P-SKE manages a construction portfolio of 386 buildings with a total contract value of ~$210.7M. This platform replaces a static single-file HTML dashboard with a fully reactive, data-driven application.

**Key capabilities (Phase 1):**
- Portfolio-wide KPI dashboard with live progress metrics
- 386-row sortable, filterable, paginated buildings register
- Status tracking: Done / In Progress / Stopped / Pending / Collapsed
- Zustand state persisted to localStorage — survives page reload
- Snapshot comparison foundation — upload new data, see delta vs previous
- 10 navigable sections with collapsible sidebar

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| State | Zustand (persist middleware) | 5.x |
| Charts | Recharts | 3.x |
| Tables | TanStack Table | 8.x |
| Excel | SheetJS (xlsx) | 0.18.5 |
| Validation | Zod | 4.x |
| Toast | Sonner | 2.x |
| PDF Export | jsPDF + html2canvas | Phase 7 |
| Dates | date-fns | 4.x |

---

## Project Structure

```
pske-platform/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout — imports globals.css + Toaster
│   ├── page.tsx                      # Redirects / → /executive
│   └── (dashboard)/                  # Route group (shared sidebar/topbar shell)
│       ├── layout.tsx                # Dashboard shell: Sidebar + Topbar + <main>
│       ├── executive/page.tsx        # Portfolio KPIs, progress rings, status breakdown
│       ├── overview/page.tsx         # Full buildings register (sort/filter/paginate)
│       ├── gantt/page.tsx            # Gantt schedule (Phase 2)
│       ├── engineering/page.tsx      # RFI tracker, engineering issues
│       ├── field/page.tsx            # Active sites, photo log (Phase 2)
│       ├── financial/page.tsx        # EAC/ETC/SPI earned value metrics
│       ├── sales/page.tsx            # Unit sales & availability
│       ├── risk/page.tsx             # Risk register
│       ├── documents/page.tsx        # Document library
│       └── settings/page.tsx         # App config + data management
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx               # Collapsible nav (section-grouped, teal active bar)
│   │   └── Topbar.tsx                # Header with portfolio summary pills
│   └── ui/                           # Reusable UI primitives
│       ├── Card.tsx                  # Base card container
│       ├── Badge.tsx                 # Status/type chip with variants
│       ├── KpiCard.tsx               # Metric card (value + trend arrow)
│       ├── ProgressRing.tsx          # SVG circular progress indicator
│       ├── SectionHeader.tsx         # h2 + subtitle + action slot
│       ├── TrendArrow.tsx            # Delta indicator (up/down arrow)
│       └── EmptyState.tsx            # Centered placeholder content
│
├── lib/
│   ├── constants/
│   │   ├── seedData.ts               # SEED_BUILDINGS: Building[] (all 386, typed)
│   │   ├── routes.ts                 # NAV_ROUTES — 10 navigation items
│   │   └── themeColors.ts            # COLORS, STATUS_COLORS for Recharts
│   └── store/
│       ├── useUIStore.ts             # Sidebar state (not persisted)
│       ├── useProjectStore.ts        # Buildings + upload history (persisted)
│       └── useConfigStore.ts         # Project configs + currency (persisted)
│
├── types/
│   ├── building.ts                   # Building interface + BuildingStatus + SalesStatus
│   ├── snapshot.ts                   # UploadSnapshot interface
│   ├── gantt.ts                      # GanttTask interface
│   ├── risk.ts                       # RiskItem interface
│   ├── defect.ts                     # Defect interface
│   ├── financial.ts                  # FinancialPeriod, EarnedValue
│   ├── document.ts                   # ProjectDocument interface
│   └── config.ts                     # AppConfig, ProjectConfig, Currency
│
├── styles/
│   └── globals.css                   # Google Fonts + Tailwind base + custom overrides
│
├── tailwind.config.ts                # P-SKE design tokens (auto-detected by postcss)
├── CLAUDE.md                         # AI assistant instructions for this codebase
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
# Navigate to the project
cd /Users/barzibahadin/div/pske-platform

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the root redirects to `/executive`.

### Build for Production

```bash
npm run build    # must pass with 0 errors
npm run start    # serve the production build
```

### Type Check

```bash
npx tsc --noEmit
```

---

## Design System

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-bg` | `#070a0f` | Page background |
| `bg-bg-2` | `#0c1018` | Sidebar background |
| `bg-surface` | `#111827` | Input backgrounds, badges |
| `bg-card` | `#141c28` | Card backgrounds |
| `border-border` | `#1e2d40` | All borders |
| `text-teal` | `#0dd9c4` | Primary accent, active states |
| `text-[#f5a623]` | `#f5a623` | Amber accent (Shary Daik) |
| `text-text` | `#e2eaf5` | Primary text |
| `text-text-2` | `#94a3b8` | Secondary text |
| `text-text-3` | `#4a5e78` | Tertiary / label text |

### Typography

| Class | Font | Usage |
|-------|------|-------|
| `font-head` | Barlow Condensed | Page titles, section headers, KPI values |
| `font-body` | Barlow | Body text, labels, descriptions |
| `font-mono` | JetBrains Mono | Numbers, codes, building IDs |

### Status Colors (for `<Badge>`)

| Status | Variant | Color |
|--------|---------|-------|
| Done | `done` | Teal |
| In Progress | `progress` | Blue |
| Stopped | `stopped` | Red |
| Pending | `pending` | Amber |
| Collaps | `collaps` | Purple |

---

## Data Architecture

### Building Interface

```typescript
interface Building {
  n: number              // unique sequence number (1–386)
  proj: string           // 'Florya City' | 'Shary Daik'
  desc: string           // building description
  bldg: string           // building ID/code (e.g. 'A-01')
  cost: number           // contract value in USD
  status: BuildingStatus // 'Done' | 'in progress' | 'Stopped' | 'Pending' | 'Collaps'
  pct: number            // completion 0.0–1.0 (NOT percent — multiply by 100 to display)
  remark?: string

  // Extended (from Excel upload — Phase 2+)
  zone?: string
  contractor?: string
  plannedStart?: string
  plannedEnd?: string
  actualStart?: string
  actualEnd?: string
  salesStatus?: 'Sold' | 'Reserved' | 'Available'
  salePrice?: number
}
```

> **Critical:** `pct` is stored as a decimal (0.0 to 1.0). Always use `Math.round(b.pct * 100)` for display.

### Data Flow

```
Excel Upload (Phase 2)
    |
    v
SheetJS parse --> raw rows
    |
    v
Zod schema validation --> typed Building[]
    |
    v
useProjectStore.importBuildings()
    |-- previousSnapshot  <-- current buildings (for delta comparison)
    |-- buildings         <-- new data
    |-- uploadHistory     <-- record appended (max 10)
    |
    v
All pages re-render via store subscription
```

### Seed Data

Before any Excel is uploaded, the app shows all 386 buildings from `lib/constants/seedData.ts`. This is the exact data migrated from the original HTML dashboard.

---

## Pages & Features

### `/executive` — Executive Summary
- Portfolio progress (weighted average across all 386 buildings)
- Total contract value
- Completed vs active vs stopped counts
- Project breakdown: Florya City vs Shary Daik progress rings
- Status distribution bar chart
- Trend delta arrows vs previous snapshot

### `/overview` — Project Overview
- Full 386-row buildings register
- Search by building code or description
- Filter by project (All / Florya City / Shary Daik)
- Filter by status (All / Done / In Progress / Stopped / Pending / Collaps)
- Sort by any column (click header, toggle asc/desc)
- Pagination (25 rows/page)
- Inline progress bars per building

### `/engineering` — Engineering
- Open RFI counter, In Review, Resolved counts
- Engineering issues list with severity/status badges
- Full RFI log and drawing tracker — Phase 2

### `/field` — Field Operations
- Active / stopped site counts
- Active sites list with progress bars
- Photo log placeholder (Phase 2)
- Defect tracker placeholder (Phase 2)

### `/financial` — Financial
- Budget at Completion (BAC) — sum of all building costs
- Earned Value (EV) — BAC multiplied by weighted progress
- SPI (Schedule Performance Index) — EV / BAC
- CPI placeholder (needs actual cost data from Excel)
- EAC, ETC, VAC calculations
- S-Curve placeholder (Phase 2)

### `/sales` — Sales & Marketing
- Shows sold / reserved / available counts if salesStatus data present
- Falls back to empty state prompting Excel upload

### `/risk` — Schedule & Risk
- Risk register table with impact / probability / status badges
- Schedule variance analysis placeholder (Phase 2)

### `/documents` — Documents
- Document type counters (Reports, Drawings, Contracts, Invoices)
- Recent documents list with type/date/size
- Full DMS with upload placeholder (Phase 2)

### `/settings` — Settings
- Project configs viewer (Florya City, Shary Daik budgets and targets)
- Upload history log (last 10 uploads)
- Data reset to seed data (with toast confirmation)
- Config reset to defaults

### `/gantt` — Gantt Schedule
- Placeholder — requires plannedStart/plannedEnd/actualStart/actualEnd from Excel (Phase 2)

---

## Zustand Stores

### `useProjectStore` (persisted: `pske_project_v1`)

```typescript
{
  buildings: Building[]           // active dataset — 386 from seed or from Excel
  previousSnapshot: Building[]    // last state before import (for delta)
  uploadHistory: UploadSnapshot[] // last 10 uploads
  lastUploadDate: string | null

  importBuildings(buildings, date): void   // saves prev snapshot, loads new data
  resetToSeedData(): void                  // restore 386 seed buildings
}
```

### `useConfigStore` (persisted: `pske_config_v1`)

```typescript
{
  config: AppConfig   // projects[], reportingCurrency, portfolio targets
  updateConfig(patch): void
  resetConfig(): void
}
```

Default config includes:
- **Florya City** — $127M budget, target Dec 2026
- **Shary Daik** — $83.7M budget, target Mar 2027

### `useUIStore` (NOT persisted — resets on page load)

```typescript
{
  sidebarCollapsed: boolean
  alertCount: number
  toggleSidebar(): void
  setAlertCount(n): void
}
```

---

## UI Components

### `<Card>`
```tsx
<Card padding="md" glow={false} className="">
  {children}
</Card>
// padding: 'none' | 'sm' | 'md' | 'lg'
// glow: adds teal box-shadow
```

### `<Badge>`
```tsx
<Badge variant="done">Done</Badge>
<Badge variant="progress">In Progress</Badge>
<Badge variant="stopped">Stopped</Badge>
<Badge variant="pending">Pending</Badge>
<Badge variant="collaps">Collapsed</Badge>
<Badge variant="teal">Custom teal</Badge>
<Badge variant="amber">Custom amber</Badge>
<Badge variant="neutral">Neutral</Badge>
```

### `<KpiCard>`
```tsx
<KpiCard
  label="Portfolio Progress"
  value="23.5%"
  sub="Weighted avg completion"
  icon="◉"
  accent="teal"          // 'teal' | 'amber' | 'red' | 'neutral'
  trend={2}              // positive = up green, negative = down red
  trendSuffix="%"
  trendInvert={false}    // true when lower-is-better (e.g. delay days)
/>
```

### `<ProgressRing>`
```tsx
<ProgressRing
  pct={72}          // 0–100
  size={64}         // px (default 64)
  stroke={5}        // px (default 5)
  color="#0dd9c4"   // CSS color
  label="72%"       // optional center text override
/>
```

### `<TrendArrow>`
```tsx
<TrendArrow value={3} suffix="%" />        // up 3% in teal
<TrendArrow value={-2} />                  // down 2 in red
<TrendArrow value={5} invert={true} />     // down 5 in red (lower is better)
<TrendArrow value={0} />                   // dash (no change)
```

### `<SectionHeader>`
```tsx
<SectionHeader
  title="Status Distribution"
  subtitle="All buildings"
  action={<button>Export</button>}   // optional right-side slot
/>
```

### `<EmptyState>`
```tsx
<EmptyState
  icon="📭"
  title="No data yet"
  description="Upload an Excel file to populate this section."
  action={<button>Upload</button>}   // optional CTA
/>
```

---

## Phase Roadmap

### Phase 1 — Foundation (Complete)
- [x] Next.js 16 scaffold with P-SKE design system
- [x] Tailwind CSS v4 with full custom token set
- [x] All TypeScript types (Building, Snapshot, Gantt, Risk, Defect, Financial, Document, Config)
- [x] 386 buildings migrated to typed seed data
- [x] Zustand stores (project, config, UI) with localStorage persist
- [x] 7 UI primitives (Card, Badge, KpiCard, ProgressRing, SectionHeader, TrendArrow, EmptyState)
- [x] Collapsible Sidebar + Topbar layout shell
- [x] 10 functional pages

### Phase 2 — Excel Import Pipeline
- [ ] `lib/excel/parseExcel.ts` — SheetJS parse + column mapping
- [ ] `lib/excel/validateSchema.ts` — Zod schema for Building fields
- [ ] `lib/excel/excelToBuildings.ts` — transform + normalize
- [ ] Upload button in Topbar — drag/drop modal
- [ ] Toast feedback on success/error with row count
- [ ] Dynamic Topbar — portfolio % and contract value from store

### Phase 3 — Executive Enhancements
- [ ] S-Curve chart (Recharts LineChart — planned vs actual cumulative %)
- [ ] Snapshot delta table (buildings that changed status or %)
- [ ] Trend arrows on all KPI cards

### Phase 4 — Overview Enhancements
- [ ] TanStack Table v8 (replace hand-rolled table)
- [ ] Column visibility toggle
- [ ] Export to CSV/Excel

### Phase 5 — Gantt Schedule
- [ ] Recharts custom Gantt bars per building
- [ ] Group by project / zone / contractor
- [ ] Today indicator line, delays highlighted in red

### Phase 6 — Financial Deep Dive
- [ ] Actual cost column from Excel upload
- [ ] Real CPI/EAC calculation
- [ ] Budget burn-down chart

### Phase 7 — Export & Print
- [ ] PDF export of Executive Summary (jsPDF + html2canvas)
- [ ] Snapshot comparison PDF report

### Phase 8 — Field & Documents
- [ ] Photo log with GPS tagging per building
- [ ] Defect tracker with photo evidence
- [ ] Document upload + versioning

---

## Excel Upload Schema (Phase 2)

The Excel file should have one row per building with these columns:

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `N` | number | Yes | Sequential number (1–386) |
| `Project` | string | Yes | `Florya City` or `Shary Daik` |
| `Description` | string | Yes | Building description |
| `Building` | string | Yes | Building code (e.g. `A-01`) |
| `Contract Value` | number | Yes | USD amount |
| `Status` | string | Yes | `Done`, `in progress`, `Stopped`, `Pending`, `Collaps` |
| `Progress %` | number | Yes | 0–100 (stored as 0.0–1.0 internally) |
| `Remark` | string | No | Optional notes |
| `Zone` | string | No | Site zone |
| `Contractor` | string | No | Contractor name |
| `Planned Start` | date | No | `YYYY-MM-DD` |
| `Planned End` | date | No | `YYYY-MM-DD` |
| `Actual Start` | date | No | `YYYY-MM-DD` |
| `Actual End` | date | No | `YYYY-MM-DD` |
| `Sales Status` | string | No | `Sold`, `Reserved`, `Available` |
| `Sale Price` | number | No | USD amount |

---

## Contributing

This is an internal P-SKE platform. When adding features:

1. Use the design system — `<Card>`, `<Badge>`, `<KpiCard>` etc., never duplicate raw styled divs
2. All data from `useProjectStore` — never hardcode building counts or contract values in pages
3. Keep `pct` as `0.0–1.0` in the store; multiply by 100 only at render time
4. Add new pages to `NAV_ROUTES` in `lib/constants/routes.ts`
5. Build must pass `npm run build` with zero errors before committing
6. TypeScript strict — no `any`, no `as unknown`

---

*P-SKE Construction Intelligence Platform — Next.js 16 · Tailwind CSS v4 · Zustand v5 · TypeScript*
