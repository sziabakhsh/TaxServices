import { useQuery } from '@tanstack/react-query'

import { getEmployeeOptions } from './employee.api'

import type { Employee } from './employee.types'

export function useEmployeeOptions() {
  return useQuery<Employee[]>({
    queryKey: ['employee-options'],
    queryFn: getEmployeeOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}