import { useQuery } from '@tanstack/react-query'

import { getTaxCases } from './case.api'

import type {
  PagedTaxCases,
  TaxCaseQueryParameters,
} from './case.types'

export function useTaxCases(
  parameters: TaxCaseQueryParameters
) {
  return useQuery<PagedTaxCases>({
    queryKey: ['tax-cases', parameters],
    queryFn: () => getTaxCases(parameters),
  })
}