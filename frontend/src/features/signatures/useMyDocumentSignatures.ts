import { useQuery } from '@tanstack/react-query'

import { getMyDocumentSignatures } from './signature.api'

export function useMyDocumentSignatures() {
  return useQuery({
    queryKey: ['document-signatures', 'mine'],
    queryFn: getMyDocumentSignatures,
  })
}