import type { Building } from '@/types/building'

// Base seed from the original P-SKE dashboard HTML file
const base: Building[] = [
  { n: 1,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A1 APV',  cost: 487625,  status: 'Done',        pct: 1,    remark: 'Opened' },
  { n: 2,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A2 APV',  cost: 495625,  status: 'Done',        pct: 1,    remark: 'Opened' },
  { n: 3,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A3 APV',  cost: 487625,  status: 'in progress', pct: 0.94 },
  { n: 4,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A4 APV',  cost: 487625,  status: 'in progress', pct: 0.91 },
  { n: 5,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A5 APV',  cost: 495625,  status: 'in progress', pct: 0.75 },
  { n: 6,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A6 APV',  cost: 597225,  status: 'Pending',     pct: 0.51 },
  { n: 7,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A7 APV',  cost: 613225,  status: 'Pending',     pct: 0.31 },
  { n: 8,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A8 APV',  cost: 605225,  status: 'Pending',     pct: 0.35 },
  { n: 9,  proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A9 APV',  cost: 613225,  status: 'Pending',     pct: 0.21 },
  { n: 10, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A10 APV', cost: 605225,  status: 'Pending',     pct: 0.19 },
  { n: 11, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A11 APV', cost: 597225,  status: 'Pending',     pct: 0.19 },
  { n: 12, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A12 APV', cost: 420182,  status: 'in progress', pct: 0.18 },
  { n: 13, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A13 APV', cost: 428182,  status: 'in progress', pct: 0.10 },
  { n: 14, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A14 APV', cost: 420182,  status: 'in progress', pct: 0.09 },
  { n: 15, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A15 APV', cost: 420182,  status: 'in progress', pct: 0.14 },
  { n: 16, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A16 APV', cost: 436182,  status: 'in progress', pct: 0.12 },
  { n: 17, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A17 APV', cost: 436182,  status: 'in progress', pct: 0.10 },
  { n: 18, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A18 APV', cost: 436182,  status: 'in progress', pct: 0.17 },
  { n: 19, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A19 APV', cost: 444182,  status: 'in progress', pct: 0.06 },
  { n: 20, proj: 'Florya City', desc: 'Apart Villa A', bldg: 'A20 APV', cost: 436182,  status: 'in progress', pct: 0.09 },
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
