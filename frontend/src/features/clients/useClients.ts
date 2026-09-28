import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createClient,
  getClientById,
  getClients,
  updateClient,
} from './client.api'

import type {
  ClientQueryParameters,
  CreateClientRequest,
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

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      request: CreateClientRequest
    ) => createClient(request),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['clients'],
      })
    },
  })
}