export type DocumentType = 'Drawing' | 'Contract' | 'Report' | 'Photo' | 'Permit' | 'Other'

export interface DocumentItem {
  id: string
  name: string
  type: DocumentType
  uploadDate: string
  size: string
  tags: string[]
  url?: string         // object URL or base64 data URI
  description?: string
}
