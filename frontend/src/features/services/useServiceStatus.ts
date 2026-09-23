import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  activateService,
  deactivateService,
} from './service.api'

export function useActivateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: activateService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['services'],
      })
    },
  })
}

export function useDeactivateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deactivateService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['services'],
      })
    },
  })
}