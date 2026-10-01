import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { signDocumentSignature } from './signature.api'
import type { SignDocumentRequest } from './signature.types'

interface SignVariables {
  signatureId: string
  request: SignDocumentRequest
}

export function useSignDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      signatureId,
      request,
    }: SignVariables) =>
      signDocumentSignature(
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