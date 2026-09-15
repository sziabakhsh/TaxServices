import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteClientDocument } from './documents.api'

type DeleteClientDocumentRequest = {
  documentId: string
  clientId: string
  taxCaseId?: string | null
}

export function useDeleteClientDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
    }: DeleteClientDocumentRequest) =>
      deleteClientDocument(documentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'documents',
          'client',
          variables.clientId,
        ],
      })

      if (variables.taxCaseId) {
        queryClient.invalidateQueries({
          queryKey: [
            'tax-case-documents',
            variables.taxCaseId,
          ],
        })
      }
    },
  })
}