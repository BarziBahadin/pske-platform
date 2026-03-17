export type Currency = 'USD' | 'EUR' | 'IQD'

export interface ProjectConfig {
  id: string
  name: string
  code: string
  color: string         // e.g. 'teal' | 'amber-brand'
  totalBudget: number
  plannedCompletion: string  // ISO date
}

export interface AppConfig {
  projects: ProjectConfig[]
  reportingCurrency: Currency
  portfolioTargetProgress: number
  portfolioTargetDate: string
  dataRefreshLabel: string
}
