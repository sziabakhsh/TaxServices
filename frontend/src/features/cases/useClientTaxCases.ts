import { useQuery } from '@tanstack/react-query'
import { getClientTaxCases } from './case.api'
import type { TaxCase } from './case.types'

export function useClientTaxCases(
  clientId: string | undefined
) {
  return useQuery<TaxCase[]>({
    queryKey: ['tax-cases', 'client', clientId],

    queryFn: () => {
      if (!clientId) {
        throw new Error('Client ID is required.')
      }

      return getClientTaxCases(clientId)
    },

    enabled: !!clientId,
  })
}