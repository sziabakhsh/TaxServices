import { useQuery } from '@tanstack/react-query'
import { getMyDocuments } from './documents.api'

export function useMyDocuments() {
  return useQuery({
    queryKey: ['documents', 'mine'],
    queryFn: getMyDocuments,
  })
}
