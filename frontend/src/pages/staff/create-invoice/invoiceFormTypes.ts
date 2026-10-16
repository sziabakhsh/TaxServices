export interface InvoiceItemForm {
  serviceId: string | null
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
}

export interface InvoiceServiceOption {
  id: string
  name: string
  basePrice?: number | null
}
