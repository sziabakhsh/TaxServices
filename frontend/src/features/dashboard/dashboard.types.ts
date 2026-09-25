import { CaseStatus } from '../cases/case.types'

export interface RecentTaxCase {
  id: string
  clientName: string
  taxYear: number
  status: CaseStatus
  openedAt: string
}

export interface StaffDashboard {
  totalClients: number
  activeEmployees: number
  openTaxCases: number
  waitingForClientCases: number
  totalDocuments: number
  recentTaxCases: RecentTaxCase[]
}

export interface ClientRecentTaxCase {
  id: string
  serviceName: string
  taxYear: number
  status: CaseStatus
  openedAt: string
}

export interface ClientDashboard {
  activeTaxCases: number
  waitingForClientCases: number
  totalDocuments: number
  recentTaxCases: ClientRecentTaxCase[]
}
