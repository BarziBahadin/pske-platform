export type RiskLikelihood = 'Low' | 'Med' | 'High'
export type RiskImpact = 'Low' | 'Med' | 'High' | 'Critical'
export type RiskStatus = 'Open' | 'In Progress' | 'Monitoring' | 'Closed'

export interface RiskItem {
  id: string
  description: string
  category: string
  likelihood: RiskLikelihood
  impact: RiskImpact
  ratingBadge: string  // badge class e.g. 'b-red'
  mitigation: string
  owner: string
  status: RiskStatus
  statusBadge: string
}
