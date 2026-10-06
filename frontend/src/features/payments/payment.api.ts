import { api } from '../../services/http/api'

import type {
  CreateManualPaymentRequest,
  Payment,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
} from './payment.types'

export async function getPaymentsByInvoice(
  invoiceId: string,
): Promise<Payment[]> {
  const response = await api.get<Payment[]>(
    `/Payments/invoice/${invoiceId}`,
  )

  return response.data
}

export async function recordManualPayment(
  request: CreateManualPaymentRequest,
): Promise<Payment> {
  const response = await api.post<Payment>(
    '/Payments/manual',
    request,
  )

  return response.data
}

export async function getMyPayments(): Promise<Payment[]> {
  const response = await api.get<Payment[]>(
    '/Payments/me',
  )

  return response.data
}

export async function createCheckoutSession(
  request: CreateCheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const response =
    await api.post<CheckoutSessionResponse>(
      '/Payments/checkout',
      request,
    )

  return response.data
}