import { api } from '../../services/http/api'
import type { StaffDashboard } from './dashboard.types'

export async function getStaffDashboard(): Promise<StaffDashboard> {
  const response = await api.get<StaffDashboard>(
    '/dashboard/staff'
  )

  return response.data
}