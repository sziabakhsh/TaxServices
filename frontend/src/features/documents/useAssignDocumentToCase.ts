import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignDocumentToCase } from './documents.api'

interface AssignDocumentToCaseVariables {
  documentId: string
  taxCaseId: string | null
}

export function useAssignDocumentToCase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      documentId,
      taxCaseId,
    }: AssignDocumentToCaseVariables) =>
      assignDocumentToCase(documentId, taxCaseId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['documents'],
      })
    },
  })
}