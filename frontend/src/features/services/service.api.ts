import { api } from '../../services/http/api'
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from './service.types'

export async function getServices(): Promise<Service[]> {
  const response = await api.get<Service[]>('/Services')

  return response.data
}

export async function getServiceById(
  id: string
): Promise<Service> {
  const response = await api.get<Service>(
    `/Services/${id}`
  )

  return response.data
}

export async function createService(
  request: CreateServiceRequest
): Promise<Service> {
  const response = await api.post<Service>(
    '/Services',
    request
  )

  return response.data
}

export async function updateService(
  id: string,
  request: UpdateServiceRequest
): Promise<Service> {
  const response = await api.put<Service>(
    `/Services/${id}`,
    request
  )

  return response.data
}

export async function activateService(
  id: string
): Promise<void> {
  await api.patch(`/Services/${id}/activate`)
}

export async function deactivateService(
  id: string
): Promise<void> {
  await api.patch(`/Services/${id}/deactivate`)
}