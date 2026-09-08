import { useQuery } from '@tanstack/react-query'
import { getMyClientProfile } from './client.api'

export function useMyClientProfile() {
  return useQuery({
    queryKey: ['client', 'me'],
    queryFn: getMyClientProfile,
  })
}