import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../features/auth/useAuth'

import './ProtectedRoute.css'

export default function ProtectedRoute({
  roles,
}: {
  roles?: string[]
}) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="route-loader">
        <div className="route-loader__spinner" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  if (
    roles &&
    !roles.some((role) =>
      user.roles.includes(role)
    )
  ) {
    const fallbackPath =
      user.roles.includes('Admin') ||
      user.roles.includes('Employee')
        ? '/staff'
        : '/portal'

    return (
      <Navigate
        to={fallbackPath}
        replace
      />
    )
  }

  return <Outlet />
}