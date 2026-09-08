import { api } from '../../services/http/api'
import type { TaxCase } from './case.types'

export async function getMyTaxCases(): Promise<TaxCase[]> {
  const response = await api.get<TaxCase[]>('/TaxCases/me')
  return response.data
}