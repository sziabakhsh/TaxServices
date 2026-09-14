import { useQuery } from '@tanstack/react-query'
import { api } from '../../services/http/api'
import type { StaffClient } from './client.types'

async function getClient(
  clientId: string
): Promise<StaffClient> {
  const response = await api.get<StaffClient>(
    `/Clients/${clientId}`
  )

  return response.data
}

export function useClient(
  clientId: string | undefined
) {
  return useQuery<StaffClient>({
    queryKey: ['client', clientId],

    queryFn: () => getClient(clientId!),

    enabled: !!clientId,
  })
}