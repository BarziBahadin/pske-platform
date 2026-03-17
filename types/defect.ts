export type DefectSeverity = 'Critical' | 'Minor'
export type DefectStatus = 'Open' | 'Closed' | 'In Review'

export interface DefectItem {
  id: string
  zone: string
  building: string
  description: string
  severity: DefectSeverity
  reported: string
  assignedTo: string
  status: DefectStatus
}
