import { useQuery } from '@tanstack/react-query'
import { getTaxCaseDocuments } from './documents.api'
import type { DocumentItem } from './documents.types'

export function useTaxCaseDocuments(
  taxCaseId: string | undefined
) {
  return useQuery<DocumentItem[]>({
    queryKey: ['tax-case-documents', taxCaseId],
    queryFn: () => getTaxCaseDocuments(taxCaseId!),
    enabled: !!taxCaseId,
  })
}