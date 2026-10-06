import { api } from '../../services/http/api'

import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from './invoice.types'

export async function getInvoices(): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>('/Invoices')

  return response.data
}

export async function getInvoiceById(
  id: string
): Promise<Invoice> {
  const response = await api.get<Invoice>(
    `/Invoices/${id}`
  )

  return response.data
}

export async function getInvoicesByClient(
  clientId: string
): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>(
    `/Invoices/client/${clientId}`
  )

  return response.data
}

export async function createInvoice(
  request: CreateInvoiceRequest
): Promise<Invoice> {
  const response = await api.post<Invoice>(
    '/Invoices',
    request
  )

  return response.data
}

export async function updateInvoice(
  id: string,
  request: UpdateInvoiceRequest
): Promise<Invoice> {
  const response = await api.put<Invoice>(
    `/Invoices/${id}`,
    request
  )

  return response.data
}

export async function issueInvoice(
  id: string
): Promise<Invoice> {
  const response = await api.post<Invoice>(
    `/Invoices/${id}/issue`
  )

  return response.data
}

export async function cancelInvoice(
  id: string
): Promise<Invoice> {
  const response = await api.post<Invoice>(
    `/Invoices/${id}/cancel`
  )

  return response.data
}

export async function getMyInvoices(): Promise<Invoice[]> {
  const response = await api.get<Invoice[]>(
    '/Invoices/me'
  )

  return response.data
}

export async function getMyInvoiceById(
  id: string
): Promise<Invoice> {
  const response = await api.get<Invoice>(
    `/Invoices/me/${id}`
  )

  return response.data
}