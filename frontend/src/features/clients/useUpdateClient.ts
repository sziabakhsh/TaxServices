import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { updateClient } from './client.api'

import type {
  StaffClient,
  UpdateClientProfileRequest,
} from './client.types'

export function useUpdateClient(
  clientId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      request: UpdateClientProfileRequest
    ) =>
      updateClient(
        clientId,
        request
      ),

    onSuccess: async (updatedClient) => {
      queryClient.setQueryData<StaffClient>(
        ['client', clientId],
        updatedClient
      )

      await queryClient.invalidateQueries({
        queryKey: ['clients'],
      })
    },
  })
}