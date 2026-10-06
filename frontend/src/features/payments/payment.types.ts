export enum PaymentMethod {
  Card = 1,
  InteracETransfer = 2,
  Cash = 3,
  ApplePay = 4,
  GooglePay = 5,
}

export enum PaymentStatus {
  Pending = 1,
  Succeeded = 2,
  Failed = 3,
  Cancelled = 4,
  Refunded = 5,
}

export const paymentMethodLabels: Record<
  PaymentMethod,
  string
> = {
  [PaymentMethod.Card]: 'Card',
  [PaymentMethod.InteracETransfer]: 'Interac e-Transfer',
  [PaymentMethod.Cash]: 'Cash',
  [PaymentMethod.ApplePay]: 'Apple Pay',
  [PaymentMethod.GooglePay]: 'Google Pay',
}

export const paymentStatusLabels: Record<
  PaymentStatus,
  string
> = {
  [PaymentStatus.Pending]: 'Pending',
  [PaymentStatus.Succeeded]: 'Succeeded',
  [PaymentStatus.Failed]: 'Failed',
  [PaymentStatus.Cancelled]: 'Cancelled',
  [PaymentStatus.Refunded]: 'Refunded',
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  createdAt: string
  paidAt?: string | null
  provider?: string | null
  providerPaymentId?: string | null
  reference?: string | null
  notes?: string | null
}

export interface CreateManualPaymentRequest {
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference?: string | null
  notes?: string | null
}

export interface CreateCheckoutSessionRequest {
  invoiceId: string
  amount: number
}

export interface CheckoutSessionResponse {
  sessionId: string
  checkoutUrl: string
}
