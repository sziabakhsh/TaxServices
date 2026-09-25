import { useQuery } from '@tanstack/react-query'
import {
  getClientDashboard,
  getStaffDashboard,
} from './dashboard.api'

export function useStaffDashboard() {
  return useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: getStaffDashboard,
  })
}

export function useClientDashboard() {
  return useQuery({
    queryKey: ['client-dashboard'],
    queryFn: getClientDashboard,
  })
}