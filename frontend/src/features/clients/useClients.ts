import {  keepPreviousData,  useQuery} from '@tanstack/react-query'

import { getClients } from './client.api'

import type {
  ClientQueryParameters,
  PagedClients,
} from './client.types'

export function useClients(
  parameters: ClientQueryParameters
) {
  return useQuery<PagedClients>({
    queryKey: [
      'clients',
      parameters.pageNumber,
      parameters.pageSize,
      parameters.search ?? '',
    ],

    queryFn: () => getClients(parameters),

    placeholderData: keepPreviousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  })
}
