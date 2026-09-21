import { useQuery } from '@tanstack/react-query'
import { getStaffDashboard } from './dashboard.api'

export function useStaffDashboard() {
  return useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: getStaffDashboard,
  })
}