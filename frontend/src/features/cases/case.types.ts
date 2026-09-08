export interface TaxCase {
  id: string
  clientId: string
  employeeId?: string | null
  taxYear: number
  status: number
  description?: string | null
  openedAt: string
  closedAt?: string | null
}