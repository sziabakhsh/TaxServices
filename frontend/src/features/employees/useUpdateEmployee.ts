import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { updateEmployee } from './employee.api'
import type { UpdateEmployeeRequest } from './employee.types'

interface UpdateEmployeeVariables {
  employeeId: string
  request: UpdateEmployeeRequest
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      employeeId,
      request,
    }: UpdateEmployeeVariables) =>
      updateEmployee(employeeId, request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees'],
      })
    },
  })
}
