export interface RecentInvoiceDashboard {
  id: string
  invoiceNumber: string
  clientName: string
  totalAmount: number
  paidAmount: number
  issueDate: string
  dueDate: string
  status: number
}

import { CaseStatus } from '../cases/case.types'

export interface RecentTaxCase {
  id: string
  clientName: string
  taxYear: number
  status: CaseStatus
  openedAt: string
}

export interface StaffDashboard {
  totalInvoiced: number
  totalCollected: number
  outstandingBalance: number
  unpaidInvoices: number
  overdueInvoices: number
  recentInvoices: RecentInvoiceDashboard[]

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
  totalInvoiced: number
  totalCollected: number
  outstandingBalance: number
  unpaidInvoices: number
  overdueInvoices: number
  recentInvoices: RecentInvoiceDashboard[]

  activeTaxCases: number
  waitingForClientCases: number
  totalDocuments: number
  recentTaxCases: ClientRecentTaxCase[]
}
