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
  employeeId?: string | null
  taxYear: number
  status: CaseStatus
  description: string
  openedAt: string
  closedAt?: string | null
}
