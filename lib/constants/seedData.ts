import type { Building } from '@/types/building'

// Base seed from the original P-SKE dashboard HTML file
const base: Building[] = [
  { n: 1,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A1 APV',  cost: 487625,  status: 'Done',        pct: 1,    remark: 'Opened',
    plannedStart: '2022-01-15', plannedEnd: '2023-09-30', actualStart: '2022-01-20', actualEnd: '2023-09-10', delayDays: -20, originalDuration: 623, actualCost: 473000 },
  { n: 2,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A2 APV',  cost: 495625,  status: 'Done',        pct: 1,    remark: 'Opened',
    plannedStart: '2022-02-01', plannedEnd: '2023-10-31', actualStart: '2022-02-10', actualEnd: '2023-11-20', delayDays: 20, originalDuration: 637, actualCost: 520000 },
  { n: 3,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A3 APV',  cost: 487625,  status: 'in progress', pct: 0.94,
    plannedStart: '2022-03-01', plannedEnd: '2024-03-31', actualStart: '2022-03-10', delayDays: 45, originalDuration: 760, actualCost: 494000 },
  { n: 4,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A4 APV',  cost: 487625,  status: 'in progress', pct: 0.91,
    plannedStart: '2022-04-01', plannedEnd: '2024-05-31', actualStart: '2022-04-15', delayDays: 32, originalDuration: 791, actualCost: 470000 },
  { n: 5,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A5 APV',  cost: 495625,  status: 'in progress', pct: 0.75,
    plannedStart: '2022-06-01', plannedEnd: '2024-12-31', actualStart: '2022-06-01', delayDays: 68, originalDuration: 944, actualCost: 416000 },
  { n: 6,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A6 APV',  cost: 597225,  status: 'Pending',     pct: 0.51,
    plannedStart: '2022-08-01', plannedEnd: '2025-06-30', actualStart: '2022-08-15', delayDays: 90, originalDuration: 1064, actualCost: 350000 },
  { n: 7,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A7 APV',  cost: 613225,  status: 'Pending',     pct: 0.31,
    plannedStart: '2022-10-01', plannedEnd: '2025-09-30', actualStart: '2022-10-20', delayDays: 120, originalDuration: 1095, actualCost: 228000 },
  { n: 8,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A8 APV',  cost: 605225,  status: 'Pending',     pct: 0.35,
    plannedStart: '2022-10-15', plannedEnd: '2025-10-31', actualStart: '2022-10-20', delayDays: 75, originalDuration: 1112, actualCost: 232000 },
  { n: 9,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A9 APV',  cost: 613225,  status: 'Pending',     pct: 0.21,
    plannedStart: '2023-01-15', plannedEnd: '2025-12-31', actualStart: '2023-02-01', delayDays: 105, originalDuration: 1051, actualCost: 152000 },
  { n: 10, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A10 APV', cost: 605225,  status: 'Pending',     pct: 0.19,
    plannedStart: '2023-02-01', plannedEnd: '2026-01-31', actualStart: '2023-02-20', delayDays: 90, originalDuration: 1095, actualCost: 130000 },
  { n: 11, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A11 APV', cost: 597225,  status: 'Pending',     pct: 0.19,
    plannedStart: '2023-03-01', plannedEnd: '2026-03-31', actualStart: '2023-03-15', delayDays: 80, originalDuration: 1126, actualCost: 125000 },
  { n: 12, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A12 APV', cost: 420182,  status: 'in progress', pct: 0.18,
    plannedStart: '2023-04-01', plannedEnd: '2026-06-30', actualStart: '2023-04-10', delayDays: 60, originalDuration: 1186, actualCost: 82000 },
  { n: 13, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A13 APV', cost: 428182,  status: 'in progress', pct: 0.10,
    plannedStart: '2023-05-01', plannedEnd: '2026-07-31', actualStart: '2023-05-20', delayDays: 45, originalDuration: 1187, actualCost: 45000 },
  { n: 14, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A14 APV', cost: 420182,  status: 'in progress', pct: 0.09,
    plannedStart: '2023-06-01', plannedEnd: '2026-08-31', actualStart: '2023-06-15', delayDays: 30, originalDuration: 1187, actualCost: 38000 },
  { n: 15, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A15 APV', cost: 420182,  status: 'in progress', pct: 0.14,
    plannedStart: '2023-07-01', plannedEnd: '2026-09-30', actualStart: '2023-07-05', delayDays: 20, originalDuration: 1187, actualCost: 59000 },
  { n: 16, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A16 APV', cost: 436182,  status: 'in progress', pct: 0.12,
    plannedStart: '2023-08-01', plannedEnd: '2026-10-31', actualStart: '2023-08-10', delayDays: 15, originalDuration: 1187, actualCost: 51000 },
  { n: 17, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A17 APV', cost: 436182,  status: 'in progress', pct: 0.10,
    plannedStart: '2023-09-01', plannedEnd: '2026-11-30', actualStart: '2023-09-01', delayDays: 10, originalDuration: 1186, actualCost: 42000 },
  { n: 18, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A18 APV', cost: 436182,  status: 'in progress', pct: 0.17,
    plannedStart: '2023-10-01', plannedEnd: '2026-12-31', actualStart: '2023-10-15', delayDays: 5, originalDuration: 1187, actualCost: 73000 },
  { n: 19, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A19 APV', cost: 444182,  status: 'in progress', pct: 0.06,
    plannedStart: '2023-11-01', plannedEnd: '2027-02-28', actualStart: '2023-11-01', delayDays: 0, originalDuration: 1215, actualCost: 27000 },
  { n: 20, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A20 APV', cost: 436182,  status: 'in progress', pct: 0.09,
    plannedStart: '2023-12-01', plannedEnd: '2027-03-31', actualStart: '2023-12-10', delayDays: 0, originalDuration: 1216, actualCost: 39000 },
]

// Sidra Villa Rel — rows 21–162
for (let i = 21; i <= 162; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Sidra Villa Rel', bldg: `SVR-${i}`, cost: 81000, status: 'Stopped', pct: 0.01 })
}

// Attach-Detach-Null — rows 163–205
for (let i = 163; i <= 205; i++) {
  base.push({
    n: i, proj: 'Florya City', desc: 'Attach-Detach-Null', bldg: `ADN-${i}`,
    cost: 0, status: i < 200 ? 'Stopped' : 'in progress', pct: i < 200 ? 0.1 : 0.6,
  })
}

// Apart Villa B — rows 206–217
for (let i = 206; i <= 217; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Apart Villa B', bldg: `B${i - 205} APV`, cost: 457690, status: 'in progress', pct: 0.29 })
}

// Painting — rows 218–229
for (let i = 218; i <= 229; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Paintting', bldg: `PT-${i}`, cost: 55000, status: 'Stopped', pct: 0.01 })
}

// SK Sky — rows 230–238
for (let i = 230; i <= 238; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'SK Sky', bldg: `SKY-${i}`, cost: 1407778, status: 'in progress', pct: 0.26 })
}

// Site Works FC — rows 239–244
for (let i = 239; i <= 244; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Site Works FC', bldg: `SW-${i}`, cost: 1216667, status: 'Stopped', pct: 0.13 })
}

// Nergis Tower Tak — rows 245–250
for (let i = 245; i <= 250; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Nergis Tower Tak', bldg: `NTT-${i}`, cost: 2227091, status: 'in progress', pct: 0.22 })
}

// Attach-Detach-Ory — rows 251–260
for (let i = 251; i <= 260; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Attach-Detach-Ory', bldg: `ADO-${i}`, cost: 0, status: 'Done', pct: 1, remark: 'Opened' })
}

// Nali-Civil — rows 261–270
for (let i = 261; i <= 270; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Nali-Civil', bldg: `NC-${i}`, cost: 733000, status: 'Stopped', pct: 0.09 })
}

// Rose Garden PET — rows 271–276
for (let i = 271; i <= 276; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Rose Garden PET', bldg: `RG-${i}`, cost: 2083831, status: 'Done', pct: 0.96, remark: 'Opened' })
}

// Nergis Tower SLK — rows 277–282
for (let i = 277; i <= 282; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'Nergis Tower SLK', bldg: `NTS-${i}`, cost: 4797872, status: 'in progress', pct: 0.64 })
}

// General Works — rows 283–315
for (let i = 283; i <= 315; i++) {
  base.push({ n: i, proj: 'Florya City', desc: 'General Works', bldg: `FC-${i}`, cost: 500000, status: 'Stopped', pct: 0.05 })
}

// Shary Daik — rows 316–386
const sdDesc = ['Kurdi-Structure', 'Salm-Structure', 'Nali-Electrical', 'Shary Daik Misc']
for (let i = 316; i <= 386; i++) {
  const desc = sdDesc[Math.min(Math.floor((i - 316) / 18), 3)]
  const status =
    i < 330 ? 'Done' :
    i < 360 ? 'in progress' :
    i < 370 ? 'Collaps' : 'Stopped'
  const pct =
    i < 330 ? 1 :
    i < 360 ? 0.45 :
    i < 370 ? 0.3 : 0.15
  base.push({ n: i, proj: 'Shary Daik', desc, bldg: `SD-${i}`, cost: 587000, status, pct })
}

export const SEED_BUILDINGS: Building[] = base
