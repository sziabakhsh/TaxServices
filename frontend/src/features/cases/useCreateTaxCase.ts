import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createTaxCase } from './case.api'
import type { CreateTaxCaseRequest } from './case.types'

export function useCreateTaxCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateTaxCaseRequest) =>
      createTaxCase(request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'tax-cases',
          'client',
          variables.clientId,
        ],
      })
    },
  })
}
