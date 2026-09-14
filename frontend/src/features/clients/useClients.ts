import { useQuery } from '@tanstack/react-query'
import { getClients } from './client.api'
import type { ClientProfile } from './client.types'

export function useClients() {
  return useQuery<ClientProfile[]>({
    queryKey: ['clients'],
    queryFn: getClients,
  })
}
