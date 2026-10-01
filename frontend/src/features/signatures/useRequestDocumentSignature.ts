import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { requestDocumentSignature } from './signature.api'

export function useRequestDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: requestDocumentSignature,

    onSuccess: async (signature) => {
      await queryClient.invalidateQueries({
        queryKey: [
          'document-signatures',
          signature.documentId,
        ],
      })

      await queryClient.invalidateQueries({
        queryKey: ['documents'],
      })
    },
  })
}