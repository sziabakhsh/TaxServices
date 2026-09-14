import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadClientDocument } from './documents.api'

type UploadClientDocumentRequest = {
  clientId: string
  file: File
  taxCaseId?: string
}

export function useUploadClientDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      file,
      taxCaseId,
    }: UploadClientDocumentRequest) =>
      uploadClientDocument(
        clientId,
        file,
        taxCaseId
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'documents',
          'client',
          variables.clientId,
        ],
      })
    },
  })
}