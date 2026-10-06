import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCheckoutSession,
  getMyPayments,
  getPaymentsByInvoice,
  recordManualPayment,
} from './payment.api'

import type {
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  CreateManualPaymentRequest,
  Payment,
} from './payment.types'

export function useInvoicePayments(
  invoiceId?: string,
) {
  return useQuery<Payment[]>({
    queryKey: [
      'payments',
      'invoice',
      invoiceId,
    ],
    queryFn: () =>
      getPaymentsByInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
  })
}

export function useRecordManualPayment(
  invoiceId: string,
) {
  const queryClient = useQueryClient()

  return useMutation<
    Payment,
    Error,
    CreateManualPaymentRequest
  >({
    mutationFn: recordManualPayment,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'payments',
            'invoice',
            invoiceId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'invoices',
            invoiceId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: ['invoices'],
        }),
      ])
    },
  })
}

export function useMyPayments() {
  return useQuery<Payment[]>({
    queryKey: ['my-payments'],
    queryFn: getMyPayments,
  })
}

export function useCreateCheckoutSession() {
  return useMutation<
    CheckoutSessionResponse,
    Error,
    CreateCheckoutSessionRequest
  >({
    mutationFn: createCheckoutSession,
  })
}