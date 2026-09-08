import { useQuery } from '@tanstack/react-query'
import { getMyTaxCases } from './case.api'

export function useMyTaxCases() {
  return useQuery({
    queryKey: ['tax-cases', 'me'],
    queryFn: getMyTaxCases,
  })
}