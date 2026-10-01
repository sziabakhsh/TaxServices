import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { markSignatureAsViewed } from './signature.api'

export function useMarkSignatureAsViewed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markSignatureAsViewed,

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