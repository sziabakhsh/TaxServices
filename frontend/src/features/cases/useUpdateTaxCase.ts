import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTaxCase } from './case.api'
import type { UpdateTaxCaseRequest } from './case.types'

type UpdateTaxCaseVariables = {
  id: string
  request: UpdateTaxCaseRequest
}

export function useUpdateTaxCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, request }: UpdateTaxCaseVariables) =>
      updateTaxCase(id, request),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tax-cases'],
      })

      queryClient.invalidateQueries({
        queryKey: ['tax-case', variables.id],
      })
    },
  })
}
