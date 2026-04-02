# P-SKE Construction Intelligence Platform

A full-stack construction portfolio management dashboard for **P-SKE**, tracking **386 buildings** across two active projects in Iraq — **Florya City** and **Shary Daik** — with a total contract value of ~$210.7M. Migrated from a static single-file HTML dashboard to a fully reactive, data-driven application driven by daily Excel uploads.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS v4 | 4.x |
| State | Zustand (persist middleware) | 5.x |
| Charts | Recharts | 3.x |
| Tables | TanStack Table | 8.x |
| Excel | SheetJS (xlsx) + Zod | 0.18.5 / 4.x |
| Toast | Sonner | 2.x |
| PDF Export | jsPDF + html2canvas | latest |
| Dates | date-fns | 4.x |

---

## Features

### Phase 1 — Foundation
- Next.js 16 scaffold with App Router `(dashboard)` route group
- Custom P-SKE dark design system with teal/amber/red accent tokens
- Zustand stores: `useProjectStore`, `useConfigStore`, `useUIStore`
- 7 reusable UI primitives: `Card`, `KpiCard`, `Badge`, `ProgressRing`, `SectionHeader`, `TrendArrow`, `EmptyState`
- Responsive sidebar (collapsible on desktop, overlay drawer on mobile)
- 11 dashboard pages scaffolded

### Phase 2 — Excel Import Pipeline
- Drag-and-drop Excel upload with SheetJS parsing
- Fuzzy column header matching via `COL_MAP` (handles client typos like "Discription", "% of Duration Remaine")
- Zod schema validation with per-row error reporting
- Upload history (last 10 snapshots), snapshot comparison for trend arrows
- Dynamic Topbar: live portfolio cost, avg progress %, last upload date

### Phase 3 — Executive S-Curve
- `computeSCurve()` derives monthly planned vs actual cumulative progress
- Recharts `ComposedChart`: teal filled area (actual) + amber dashed line (planned)
- Snapshot delta table showing what changed since last upload with `TrendArrow` indicators

### Phase 4 — TanStack Table
- Overview rebuilt with TanStack Table v8
- Column sorting, pagination (25/page), column visibility toggle
- Columns: #, Building, Project, Description, Status, Progress, Cost, Delay

### Phase 5 — Gantt Schedule
- CSS-based Gantt bars: planned (blue), actual (teal), delay (red) per building
- Today marker, horizontal scroll
- KPIs: On Schedule, Delayed, Avg Delay, Total Duration
- Project + search filters

### Phase 6 — Financial EVM
- Full Earned Value Management: BAC, EV, AC, CPI, SPI, EAC, ETC, VAC, CV
- Real CPI/EAC calculated when `actualCost` column is present in uploaded Excel
- 8 KPI cards with color-coded health (≥0.95 teal, <0.95 red)
- Budget vs Earned vs Actual 3-bar chart (top 10 packages)
- CPI per building horizontal bar chart with reference line at 1.0
- Per-project EVM breakdown table

### Phase 7 — PDF Export
- `exportToPdf()` — html2canvas DOM capture → multi-page A4 PDF (jsPDF)
- Header strip per page: P-SKE branding, report title, date + page counter, teal accent line
- `ExportPdfButton` component — loading spinner, auto-hidden from PDF via `no-print` class
- Available on: Executive, Financial, Risk, Gantt, Field Operations, Documents

### Phase 8 — Field Operations & Document DMS
- **Photo Log**: upload + auto-compress images (max 900px JPEG), link to building, thumbnail grid, stored in Zustand/localStorage
- **Defect Tracker**: add/remove defects, status lifecycle (`open → in-review → resolved → closed`), priority levels (low/medium/high/critical), filter tabs, seeded with 5 realistic defects
- **Document DMS**: register documents by title/type/project/date, search + type/project filters, type breakdown cards, seeded with 7 project documents

---

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/executive` | Executive Summary | S-Curve chart, KPIs, snapshot delta table, trend arrows |
| `/overview` | Project Overview | TanStack Table — all 386 buildings with sort/filter/pagination |
| `/gantt` | Gantt Schedule | CSS Gantt — planned vs actual vs delay bars, today marker |
| `/financial` | Financial | Full EVM: CPI/SPI/EAC/ETC/VAC/CV, 3-bar chart, CPI per building |
| `/risk` | Schedule & Risk | Risk register, delay distribution chart, project health radar |
| `/field` | Field Operations | Active sites list, photo log, defect tracker |
| `/documents` | Documents | Document DMS — register, search, filter by type/project |
| `/sales` | Sales & Marketing | Unit sales pipeline |
| `/engineering` | Engineering | Engineering issues dashboard |
| `/upload` | Data Upload | Excel drag-and-drop import with validation |
| `/settings` | Settings | Project config, upload history, data reset |

---

## Project Structure

```
pske-platform/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Sidebar + Topbar shell
│   │   ├── executive/page.tsx   # S-curve + delta + KPIs
│   │   ├── overview/page.tsx    # TanStack Table
│   │   ├── gantt/page.tsx       # CSS Gantt chart
│   │   ├── financial/page.tsx   # EVM dashboard
│   │   ├── risk/page.tsx        # Risk register + radar
│   │   ├── field/page.tsx       # Photo log + defect tracker
│   │   ├── documents/page.tsx   # Document DMS
│   │   └── ...
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── charts/
│   │   └── SCurveChart.tsx      # Recharts S-curve (actual + planned)
│   ├── layout/
│   │   ├── Sidebar.tsx          # Collapsible nav, mobile overlay drawer
│   │   └── Topbar.tsx           # Live portfolio pills, hamburger
│   └── ui/                      # Card, Badge, KpiCard, ProgressRing,
│                                 # SectionHeader, TrendArrow, EmptyState,
│                                 # ExportPdfButton
│
├── lib/
│   ├── constants/
│   │   ├── seedData.ts          # 386 seed buildings (typed)
│   │   ├── routes.ts            # NAV_ROUTES array
│   │   └── themeColors.ts       # COLORS, STATUS_COLORS for Recharts
│   ├── derived/
│   │   ├── computeSCurve.ts     # computeSCurve() + computeDeltas()
│   │   └── computeGantt.ts      # computeGantt() + groupGanttRows()
│   ├── excel/
│   │   └── parseUpload.ts       # SheetJS + Zod + COL_MAP pipeline
│   ├── store/
│   │   ├── useProjectStore.ts   # buildings + upload history (persisted)
│   │   ├── useConfigStore.ts    # project configs + currency (persisted)
│   │   ├── useUIStore.ts        # sidebar state (not persisted)
│   │   ├── useFieldStore.ts     # photos + defects (persisted)
│   │   └── useDocumentStore.ts  # document registry (persisted)
│   └── utils/
│       └── exportPdf.ts         # multi-page A4 PDF generator
│
├── types/
│   ├── building.ts              # Building interface + BuildingStatus
│   ├── snapshot.ts              # UploadSnapshot interface
│   └── config.ts                # AppConfig, ProjectConfig
│
├── styles/globals.css
├── tailwind.config.ts           # P-SKE design tokens
└── CLAUDE.md                    # AI assistant instructions
```

---

## Data Rules

- `Building.pct` is **0.0 – 1.0** — always multiply by 100 for display
- `Building.proj` exact values: `'Florya City'` | `'Shary Daik'`
- `BuildingStatus`: `'Done' | 'in progress' | 'Stopped' | 'Pending' | 'Collaps'`
- Never hardcode building counts or contract values in pages — always derive from `useProjectStore`

---

## Excel Upload Schema

The Excel file should have one row per building. Column headers are matched fuzzily — both exact names and common variants are recognized:

| Field | Example headers | Required |
|-------|----------------|----------|
| Sequence # | `N`, `No` | Yes |
| Project | `Project`, `Project Name` | Yes |
| Building | `Building`, `Bldg` | Yes |
| Description | `Description`, `Discription` | Yes |
| Cost | `Grand Total Cost $`, `Contract Value` | Yes |
| Status | `Status` | Yes |
| Progress | `Actual % Complete Current Month`, `% Complete` | Yes |
| Planned Start | `Planned Start`, `Plan Start` | No |
| Planned End | `Planned End`, `Plan End` | No |
| Actual Start | `Actual Start`, `Act Start` | No |
| Actual End | `Actual End`, `Act End` | No |
| Delay Days | `(Delay) Day`, `Delay Days` | No |
| Actual Cost | `Actual Cost`, `AC`, `Cost to Date` | No (enables real CPI) |
| Duration % Remaining | `% of Duration Remaine`, `Duration Remaining` | No |

---

## Zustand Stores

| Store | Persist key | Contents |
|-------|-------------|----------|
| `useProjectStore` | `pske_project_v1` | buildings, previousSnapshot, uploadHistory, lastUploadDate |
| `useConfigStore` | `pske_config_v1` | project configs, reporting currency |
| `useFieldStore` | `pske_field_v1` | photos (base64), defects |
| `useDocumentStore` | `pske_docs_v1` | document metadata |
| `useUIStore` | — (not persisted) | sidebarCollapsed, mobileOpen |

---

## Design System

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-bg` | `#070a0f` | Page background |
| `bg-card` | `#141c28` | Card backgrounds |
| `bg-surface` | `#111827` | Input backgrounds |
| `border-border` | `#1e2d40` | All borders |
| `text-teal` | `#0dd9c4` | Primary accent |
| `text-amber-brand` | `#f5a623` | Amber accent |
| `text-text` | `#e2eaf5` | Primary text |
| `text-text-2` | `#94a3b8` | Secondary text |
| `text-text-3` | `#4a5e78` | Labels / tertiary |

### Typography

| Class | Font | Usage |
|-------|------|-------|
| `font-head` | Barlow Condensed | Page titles, KPI values |
| `font-body` | Barlow | Body text, descriptions |
| `font-mono` | JetBrains Mono | Numbers, codes, IDs |

---

## Development

```bash
npm run dev      # dev server at localhost:3000
npm run build    # production build (must pass 0 errors)
npx tsc --noEmit # type-check only
```

---

## Known Quirks

- Building codes (`bldg`) are not unique across projects — use `proj + bldg + n` as React key
- Seed data has no `plannedStart`/`plannedEnd` — S-curve planned line appears only after a real Excel upload
- `xlsx` package has a known prototype pollution CVE — accepted for internal trusted-file use only
- Photos are stored as base64 in localStorage via Zustand persist — large numbers of high-res photos may approach browser storage limits (~5–10 MB)

---

*P-SKE Construction Intelligence Platform · Next.js 16 · Tailwind CSS v4 · Zustand v5 · TypeScript*
