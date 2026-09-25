export interface DocumentItem {
  id: string
  clientId: string
  clientName: string
  taxCaseId?: string | null
  fileName: string
  contentType: string
  fileSize: number
  uploadedAt: string
  taxYear?: number | null
  caseStatus?: number | null
  serviceName?: string | null
}

export interface UploadDocumentRequest {
  taxCaseId?: string | null
  file: File
}

export interface DocumentQueryParameters {
  pageNumber: number
  pageSize: number
  search?: string
  clientId?: string
  taxCaseId?: string
  taxYear?: number
}

export interface PagedDocuments {
  items: DocumentItem[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}