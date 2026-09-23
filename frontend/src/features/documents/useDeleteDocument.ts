import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { deleteClientDocument } from './documents.api'

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClientDocument,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['documents'],
      })
    },
  })
}
