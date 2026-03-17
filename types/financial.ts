export interface MonthlyFinancial {
  month: string
  budgeted: number   // millions USD
  actual: number
  cashIn?: number
  cashOut?: number
}

export interface SCurvePoint {
  period: string
  plannedPct: number
  actualPct: number | null
  forecastPct?: number | null
}

export interface PaymentMilestone {
  name: string
  amount: string
  date: string
  color: string
  status: string
}
