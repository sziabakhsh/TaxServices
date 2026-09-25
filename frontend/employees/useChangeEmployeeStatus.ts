import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  activateEmployee,
  deactivateEmployee,
} from './employee.api'

interface ChangeEmployeeStatusVariables {
  employeeId: string
  isActive: boolean
}

export function useChangeEmployeeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      employeeId,
      isActive,
    }: ChangeEmployeeStatusVariables) => {
      if (isActive) {
        await deactivateEmployee(employeeId)
      } else {
        await activateEmployee(employeeId)
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['employees'],
      })
    },
  })
}