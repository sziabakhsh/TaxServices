import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { getEmployees } from './employee.api'

import type {
  EmployeeQueryParameters,
  PagedEmployees,
} from './employee.types'

export function useEmployees(
  parameters: EmployeeQueryParameters
) {
  return useQuery<PagedEmployees>({
    queryKey: [
      'employees',
      parameters.pageNumber,
      parameters.pageSize,
      parameters.search ?? '',
      parameters.isActive ?? 'all',
    ],

    queryFn: () => getEmployees(parameters),

    placeholderData: keepPreviousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  })
}