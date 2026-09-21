import { useQuery } from '@tanstack/react-query'

import { getTaxCases } from './case.api'

import type { TaxCase } from './case.types'

export function useTaxCases() {
  return useQuery<TaxCase[]>({
    queryKey: ['tax-cases'],
    queryFn: getTaxCases,
  })
}