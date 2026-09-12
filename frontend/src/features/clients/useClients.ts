import { useQuery } from '@tanstack/react-query'
import { getClients } from './client.api'
import type { StaffClient } from './client.types'

export function useClients() {
  return useQuery<StaffClient[]>({
    queryKey: ['clients'],
    queryFn: getClients,
  })
}