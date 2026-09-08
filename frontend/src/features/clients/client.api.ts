import {api} from '../../services/http/api'
import type { ClientProfile } from './client.types'

export async function getMyClientProfile(): Promise<ClientProfile> {
  const response = await api.get<ClientProfile>('/clients/me')
  return response.data
}