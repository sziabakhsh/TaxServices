export interface DocumentItem {
  id: string
  clientId: string
  taxCaseId?: string | null
  fileName: string
  contentType: string
  fileSize: number
  uploadedAt: string
}

export interface UploadDocumentRequest {
  taxCaseId?: string | null
  file: File
}