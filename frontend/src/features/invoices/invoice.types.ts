export interface InvoiceItem {
  id: string
  serviceId: string | null
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
  amount: number
}

export interface InvoiceItemRequest {
  serviceId: string | null
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
}

export enum InvoiceStatus {
  Draft = 1,
  Issued = 2,
  Paid = 3,
  Overdue = 4,
  Cancelled = 5,
}

export const invoiceStatusLabels: Record<
  InvoiceStatus,
  string
> = {
  [InvoiceStatus.Draft]: 'Draft',
  [InvoiceStatus.Issued]: 'Issued',
  [InvoiceStatus.Paid]: 'Paid',
  [InvoiceStatus.Overdue]: 'Overdue',
  [InvoiceStatus.Cancelled]: 'Cancelled',
}

export interface Invoice {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  taxRate: number
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string | null
  items: InvoiceItem[]
}


export interface CreateInvoiceRequest {
  clientId: string
  issueDate: string
  dueDate: string
  taxRate: number
  notes?: string | null
  items: InvoiceItemRequest[]
}

export interface UpdateInvoiceRequest {
  issueDate: string
  dueDate: string
  taxRate: number
  notes?: string | null
  items: InvoiceItemRequest[]
}

