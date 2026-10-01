import { useQuery } from '@tanstack/react-query'

import { getMyDocumentSignature } from './signature.api'

export function useMyDocumentSignature(
  signatureId?: string
) {
  return useQuery({
    queryKey: [
      'document-signatures',
      'mine',
      signatureId,
    ],

    queryFn: () =>
      getMyDocumentSignature(signatureId!),

    enabled: Boolean(signatureId),
  })
}