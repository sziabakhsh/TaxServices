import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateService } from './service.api'
import type { UpdateServiceRequest } from './service.types'

interface UpdateServiceVariables {
  id: string
  request: UpdateServiceRequest
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: UpdateServiceVariables) =>
      updateService(id, request),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['services'],
      })
    },
  })
}