export interface DocumentItem {
  id: string
  clientId: string
  taxCaseId?: string | null
  fileName: string
  contentType: string
  fileSize: number
  uploadedAt: string
  taxYear?: number | null
  caseStatus?: number | null
}

export interface UploadDocumentRequest {
  taxCaseId?: string | null
  file: File
}