import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { createEmployee } from './employee.api'

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees'],
      })
    },
  })
}