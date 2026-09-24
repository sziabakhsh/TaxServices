import { api } from '../../services/http/api'

import type {
  CreateTaxCaseRequest,
  UpdateTaxCaseRequest,
  PagedTaxCases,
  TaxCase,
  TaxCaseQueryParameters,
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
  const response = await api.get<TaxCase[]>(
    '/TaxCases/me'
  )

  return response.data
}

export async function getMyTaxCaseById(
  id: string
): Promise<TaxCase> {
  const response = await api.get<TaxCase>(
    `/TaxCases/me/${id}`
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

export async function updateTaxCase(
  id: string,
  request: UpdateTaxCaseRequest
): Promise<TaxCase> {
  const response = await api.put<TaxCase>(
    `/TaxCases/${id}`,
    request
  )

  return response.data
}

export async function getTaxCases(
  parameters: TaxCaseQueryParameters
): Promise<PagedTaxCases> {
  const response = await api.get<PagedTaxCases>(
    '/TaxCases',
    {
      params: parameters,
    }
  )

  return response.data
}