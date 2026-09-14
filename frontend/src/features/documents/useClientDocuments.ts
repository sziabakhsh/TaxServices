import { useQuery } from '@tanstack/react-query'
import { getClientDocuments } from './documents.api'
import type { DocumentItem } from './documents.types'

export function useClientDocuments(clientId: string | undefined) {
  return useQuery<DocumentItem[]>({
    queryKey: ['documents', 'client', clientId],

    queryFn: () => {
      if (!clientId) {
        throw new Error('Client ID is required.')
      }

      return getClientDocuments(clientId)
    },

    enabled: !!clientId,
  })
}