import { useQuery } from '@tanstack/react-query'

import { getDocumentSignatures } from './signature.api'

export function useDocumentSignatures(
  documentId?: string
) {
  return useQuery({
    queryKey: [
      'document-signatures',
      documentId,
    ],

    queryFn: () =>
      getDocumentSignatures(documentId!),

    enabled: Boolean(documentId),
  })
}