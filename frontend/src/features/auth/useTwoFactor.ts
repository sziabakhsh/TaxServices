import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  confirmDisableTwoFactor,
  confirmEnableTwoFactor,
  getTwoFactorStatus,
  requestDisableTwoFactor,
  requestEnableTwoFactor,
} from './auth.api'

export const twoFactorKeys = {
  status: ['auth', 'two-factor-status'] as const,
}

export function useTwoFactorStatus() {
  return useQuery({
    queryKey: twoFactorKeys.status,
    queryFn: getTwoFactorStatus,
  })
}

export function useRequestEnableTwoFactor() {
  return useMutation({
    mutationFn: requestEnableTwoFactor,
  })
}

export function useConfirmEnableTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmEnableTwoFactor,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorKeys.status,
      })
    },
  })
}

export function useRequestDisableTwoFactor() {
  return useMutation({
    mutationFn: requestDisableTwoFactor,
  })
}

export function useConfirmDisableTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: confirmDisableTwoFactor,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorKeys.status,
      })
    },
  })
}