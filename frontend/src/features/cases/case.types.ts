export enum CaseStatus {
  Draft = 1,
  Open = 2,
  InProgress = 3,
  WaitingForClient = 4,
  Completed = 5,
  Cancelled = 6,
}

export interface TaxCase {
  id: string
  clientId: string
  clientName: string
  serviceId: string
  serviceName: string

  employeeId?: string | null
  taxYear: number
  status: CaseStatus
  description: string
  openedAt: string
  closedAt?: string | null
}

export interface CreateTaxCaseRequest {
  clientId: string
  serviceId: string
  employeeId?: string | null
  taxYear: number
  description: string
}

export interface UpdateTaxCaseRequest {
  serviceId: string
  employeeId?: string | null
  taxYear: number
  status: CaseStatus
  description: string
}

export interface TaxCaseQueryParameters {
  pageNumber: number
  pageSize: number
  search?: string
  status?: string
}

export interface PagedTaxCases {
  items: TaxCase[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}