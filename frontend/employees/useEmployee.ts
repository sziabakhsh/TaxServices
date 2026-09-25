import { useQuery } from '@tanstack/react-query'

import { getEmployeeById } from './employee.api'
import type { Employee } from './employee.types'

export function useEmployee(
  employeeId: string | undefined
) {
  return useQuery<Employee>({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployeeById(employeeId!),
    enabled: !!employeeId,
  })
}