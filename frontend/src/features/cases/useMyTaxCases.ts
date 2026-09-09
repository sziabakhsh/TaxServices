import { useQuery } from '@tanstack/react-query'
import {
  getMyTaxCaseById,
  getMyTaxCases,
} from './case.api'

export function useMyTaxCases() {
  return useQuery({
    queryKey: ['tax-cases', 'me'],
    queryFn: getMyTaxCases,
  })
}

export function useMyTaxCase(id: string) {
  return useQuery({
    queryKey: ['tax-case', 'me', id],
    queryFn: () => getMyTaxCaseById(id),
    enabled: Boolean(id),
  })
}