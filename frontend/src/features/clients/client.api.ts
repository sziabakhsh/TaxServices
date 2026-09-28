import { api } from '../../services/http/api'

import type {
  ClientProfile,
  ClientQueryParameters,
  PagedClients,
  UpdateClientProfileRequest,
  CreateClientRequest,
  StaffClient,
} from './client.types'

export async function getMyClientProfile(): Promise<ClientProfile> {
  const response = await api.get<ClientProfile>(
    '/clients/me'
  )

  return response.data
}

export async function updateMyClientProfile(
  request: UpdateClientProfileRequest
): Promise<ClientProfile> {
  const response = await api.put<ClientProfile>(
    '/clients/me',
    request
  )

  return response.data
}

export async function getClients(
  parameters: ClientQueryParameters
): Promise<PagedClients> {
  const response = await api.get<PagedClients>(
    '/clients',
    {
      params: parameters,
    }
  )

  return response.data
}

export async function getClientById(
  clientId: string
) {
  const response = await api.get(
    `/clients/${clientId}`
  )

  return response.data
}

export async function createClient(
  request: CreateClientRequest
): Promise<ClientProfile> {
  const response = await api.post<{
    client: ClientProfile
  }>(
    '/clients',
    request
  )

  return response.data.client
}

export async function updateClient(
  clientId: string,
  request: UpdateClientProfileRequest
): Promise<StaffClient> {
  const response = await api.put<StaffClient>(
    `/clients/${clientId}`,
    request
  )

  return response.data
}