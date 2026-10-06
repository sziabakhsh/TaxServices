import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  cancelInvoice,
  createInvoice,
  getInvoiceById,
  getInvoices,
  getInvoicesByClient,
  getMyInvoiceById,
  getMyInvoices,
  issueInvoice,
  updateInvoice,
} from './invoice.api'

import type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from './invoice.types'

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  })
}

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => getInvoiceById(id!),
    enabled: Boolean(id),
  })
}

export function useClientInvoices(clientId?: string) {
  return useQuery({
    queryKey: ['invoices', 'client', clientId],
    queryFn: () => getInvoicesByClient(clientId!),
    enabled: Boolean(clientId),
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateInvoiceRequest) =>
      createInvoice(request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateInvoiceRequest) =>
      updateInvoice(id, request),

    onSuccess: invoice => {
      queryClient.setQueryData(
        ['invoices', id],
        invoice
      )

      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

export function useIssueInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      issueInvoice(id),

    onSuccess: invoice => {
      queryClient.setQueryData(
        ['invoices', invoice.id],
        invoice
      )

      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      cancelInvoice(id),

    onSuccess: invoice => {
      queryClient.setQueryData(
        ['invoices', invoice.id],
        invoice
      )

      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      })
    },
  })
}

export function useMyInvoices() {
  return useQuery({
    queryKey: ['my-invoices'],
    queryFn: getMyInvoices,
  })
}

export function useMyInvoice(id?: string) {
  return useQuery({
    queryKey: ['my-invoices', id],
    queryFn: () => getMyInvoiceById(id!),
    enabled: Boolean(id),
  })
}