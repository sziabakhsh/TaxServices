import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadDocument } from './documents.api'
import type { UploadDocumentRequest } from './documents.types'

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UploadDocumentRequest) =>
      uploadDocument(request),
    onSuccess: () => {
    queryClient.invalidateQueries({
        queryKey: ['documents'],
    })
    },
  })
}

