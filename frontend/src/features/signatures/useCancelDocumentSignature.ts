import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { cancelDocumentSignature } from './signature.api'

export function useCancelDocumentSignature() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelDocumentSignature,

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