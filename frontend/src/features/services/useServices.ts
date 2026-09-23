import { useQuery } from '@tanstack/react-query'
import { getServices } from './service.api'
import type { Service } from './service.types'

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: getServices,
  })
}