import { api } from '../../services/http/api'
import type {
  ClientDashboard,
  StaffDashboard,
} from './dashboard.types'

export async function getStaffDashboard(): Promise<StaffDashboard> {
  const response = await api.get<StaffDashboard>(
    '/dashboard/staff'
  )

  return response.data
}

export async function getClientDashboard(): Promise<ClientDashboard> {
  const response = await api.get<ClientDashboard>(
    '/dashboard/client'
  )

  return response.data
}