import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { declineDocumentSignature } from './signature.api'
import type { DeclineDocumentSignatureRequest } from './signature.types'

interface DeclineVariables {
  signatureId: string
  request: DeclineDocumentSignatureRequest
}

export function useDeclineDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      signatureId,
      request,
    }: DeclineVariables) =>
      declineDocumentSignature(
        signatureId,
        request
      ),

    onSuccess: async (signature) => {
      await queryClient.invalidateQueries({
        queryKey: [
          'document-signatures',
          'mine',
        ],
      })

      await queryClient.invalidateQueries({
        queryKey: [
          'document-signatures',
          'mine',
          signature.id,
        ],
      })
    },
  })
}