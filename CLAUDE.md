# CLAUDE.md — P-SKE Construction Intelligence Platform

## What this project is
A Next.js 16 (App Router) project management control center for P-SKE's construction portfolio of **386 buildings** across two projects in Iraq: **Florya City** and **Shary Daik**. Migrated from a hardcoded single-file HTML dashboard. Daily Excel upload drives all data.

## Stack
| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 + custom P-SKE design tokens |
| State | Zustand v5 with persist middleware |
| Charts | Recharts v3 |
| Tables | TanStack Table v8 |
| Excel import | SheetJS (xlsx) + Zod validation |
| Toast | Sonner |
| Icons | Lucide React + emoji icons |
| Dates | date-fns |
| PDF export | jsPDF + html2canvas |

## Design system rules
- **Colors** — always use Tailwind tokens, never raw hex in className:
  - `bg-bg`, `bg-card`, `bg-surface` for backgrounds
  - `text-text`, `text-text-2`, `text-text-3` for text hierarchy
  - `text-teal` / `bg-teal` for primary accent
  - `border-border` for all borders
- **Fonts** — `font-head` (Barlow Condensed), `font-body` (Barlow), `font-mono` (JetBrains Mono)
- **Spacing** — default `p-4` for cards, `gap-3` for KPI grids, `gap-4` for section grids
- **Borders** — always `border-border` or `border-border/40` (never raw color)
- **Cards** — use `<Card>` component, never raw div with bg/border duplicated

## Data rules
- `Building.pct` is **0.0 to 1.0** — always multiply by 100 for % display
- `Building.proj` exact values: `'Florya City'` | `'Shary Daik'`
- `BuildingStatus` exact values: `'Done' | 'in progress' | 'Stopped' | 'Pending' | 'Collaps'`
- **Never hardcode building counts or contract values** in pages — always derive from `useProjectStore`
- Seed data lives in `lib/constants/seedData.ts` as `SEED_BUILDINGS`

## State architecture
```
useProjectStore (persisted: pske_project_v1)
  buildings[]          ← active dataset (from Excel or seed)
  previousSnapshot[]   ← previous upload for delta/trend arrows
  uploadHistory[]      ← last 10 uploads
  lastUploadDate

useConfigStore (persisted: pske_config_v1)
  config.projects[]    ← Florya City + Shary Daik definitions
  config.reportingCurrency

useUIStore (NOT persisted)
  sidebarCollapsed
  mobileOpen

useFieldStore (persisted: pske_field_v1)
  photos[]     ← base64-compressed site photos linked to buildings
  defects[]    ← defect tracker (open/in-review/resolved/closed)

useDocumentStore (persisted: pske_docs_v1)
  documents[]  ← document metadata registry
```

## Folder conventions
- `app/(dashboard)/[page]/page.tsx` — all dashboard pages (route group keeps URLs clean)
- `components/ui/` — pure presentational primitives (no store access)
- `components/layout/` — layout shells (may access stores)
- `lib/constants/` — static seed data and config
- `lib/store/` — all Zustand stores
- `lib/derived/` — pure functions that compute metrics from Building[] (Phase 2+)
- `types/` — all shared TypeScript interfaces

## Adding a new page
1. Create `app/(dashboard)/[name]/page.tsx`
2. Add entry to `lib/constants/routes.ts` NAV_ROUTES array
3. Page gets Sidebar + Topbar automatically from `app/(dashboard)/layout.tsx`
4. Use `useProjectStore` for data, derive metrics with `useMemo`
5. Never import from `lib/constants/seedData.ts` directly in pages

## Tailwind v4 notes
- Config file `tailwind.config.ts` at project root is **auto-detected** by `@tailwindcss/postcss` — no `@config` directive needed
- CSS import order in `styles/globals.css`: Google Fonts `@import url(...)` MUST come before `@import "tailwindcss"`
- `scrollbar-none` is NOT a v4 built-in — use `overflow-hidden` or `scrollbar-width: none` in CSS

## Phase roadmap
| Phase | Status | Scope |
|-------|--------|-------|
| 1 | **Done** | Foundation: scaffold, design system, all stores, 7 UI primitives, 10 pages |
| 2 | **Done** | Excel import pipeline (SheetJS → Zod → store), dynamic Topbar |
| 3 | **Done** | Executive S-Curve chart, snapshot diff with trend arrows |
| 4 | **Done** | TanStack Table in Overview (sort/filter/column visibility) |
| 5 | **Done** | Gantt chart (CSS bars, today marker, delay bars, project filters) |
| 6 | **Done** | Financial: real CPI/EAC from actualCost, full EVM KPIs + charts |
| 7 | **Done** | PDF export (jsPDF + html2canvas) on all major pages |
| 8 | **Done** | Photo log, defect tracker (CRUD + lifecycle), document DMS |

## Commands
```bash
npm run dev      # development server (localhost:3000)
npm run build    # production build (must pass 0 errors)
npx tsc --noEmit # type-check only
```

## Important — known quirks
- `app/globals.css` exists from scaffold but is **unused** — root layout imports `@/styles/globals.css`
- xlsx package has a known high-severity vulnerability (Prototype Pollution, ReDoS) — accepted for internal trusted-file use only
- Photos are stored as base64 in localStorage via Zustand persist — large numbers of photos may approach browser storage limits
- Building codes (`bldg`) are not unique across projects — use `proj + bldg + n` as React key
