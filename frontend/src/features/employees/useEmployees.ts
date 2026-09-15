import { useQuery } from '@tanstack/react-query'

import { getEmployees } from './employee.api'
import type { Employee } from './employee.types'

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: getEmployees,
  })
}