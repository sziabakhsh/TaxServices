import {
  keepPreviousData,
  useQuery,
} from '@tanstack/react-query'

import { getDocuments } from './documents.api'
import type { DocumentQueryParameters } from './documents.types'

export function useDocuments(
  parameters: DocumentQueryParameters
) {
  return useQuery({
    queryKey: ['documents', parameters],
    queryFn: () => getDocuments(parameters),
    placeholderData: keepPreviousData,
  })
}