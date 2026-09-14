import { api } from '../../services/http/api'
import type {
  CreateTaxCaseRequest,
  TaxCase,
} from './case.types'

export async function createTaxCase(
  request: CreateTaxCaseRequest
): Promise<TaxCase> {
  const response = await api.post<TaxCase>(
    '/TaxCases',
    request
  )

  return response.data
}

export async function getMyTaxCases(): Promise<TaxCase[]> {
  const response = await api.get<TaxCase[]>('/TaxCases/me')
  return response.data
}

export async function getMyTaxCaseById(
  id: string,
): Promise<TaxCase> {
  const response = await api.get<TaxCase>(
    `/TaxCases/me/${id}`,
  )

  return response.data
}

export async function getClientTaxCases(
  clientId: string
): Promise<TaxCase[]> {
  const response = await api.get<TaxCase[]>(
    `/taxcases/client/${clientId}`
  )

  return response.data
}

export type UpdateTaxCaseRequest = {
  employeeId: string | null
  taxYear: number
  status: number
  description: string
}

export async function updateTaxCase(
  id: string,
  request: UpdateTaxCaseRequest
) {
  const response = await api.put(`/TaxCases/${id}`, request)

  return response.data
}

