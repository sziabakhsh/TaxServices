import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateMyClientProfile } from './client.api'

export function useUpdateMyClientProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyClientProfile,

    onSuccess: (updatedClient) => {
      queryClient.setQueryData(
        ['client', 'me'],
        updatedClient,
      )
    },
  })
}