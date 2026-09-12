import { api } from '../../services/http/api'
import type {
  ClientProfile,
  UpdateClientProfileRequest,
} from './client.types'

export async function getMyClientProfile(): Promise<ClientProfile> {
  const response = await api.get<ClientProfile>('/clients/me')
  return response.data
}

export async function updateMyClientProfile(
  request: UpdateClientProfileRequest,
): Promise<ClientProfile> {
  const response = await api.put<ClientProfile>(
    '/clients/me',
    request,
  )

  return response.data
}

export async function getClients() {
  const response = await api.get('/clients')
  return response.data
}

