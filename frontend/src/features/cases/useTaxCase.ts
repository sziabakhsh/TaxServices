import { useQuery } from '@tanstack/react-query'

import { api } from '../../services/http/api'
import type { TaxCase } from './case.types'

async function getTaxCase(id: string): Promise<TaxCase> {
  const response = await api.get<TaxCase>(`/TaxCases/${id}`)

  return response.data
}

export function useTaxCase(id: string | undefined) {
  return useQuery<TaxCase>({
    queryKey: ['tax-case', id],
    queryFn: () => getTaxCase(id!),
    enabled: !!id,
  })
}