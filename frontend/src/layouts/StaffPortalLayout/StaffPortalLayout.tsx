import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  FileText,
  LayoutDashboard,
  LogOut,
  UserRoundCog,
  Users,
} from 'lucide-react'


import { useAuth } from '../../features/auth/useAuth'
import './StaffPortalLayout.css'

export default function StaffPortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean
  }) =>
    isActive
      ? 'staff-layout__nav-link staff-layout__nav-link--active'
      : 'staff-layout__nav-link'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="staff-layout">
      <aside className="staff-layout__sidebar">
        <div className="staff-layout__brand">
          <NavLink to="/">
            <img
              src="/amazing-logo.png"
              alt="Amazing Accountant and Tax Services"
              className="staff-layout__logo"
            />
          </NavLink>
        </div>

        <div className="staff-layout__user">
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>

          <span>{user?.email}</span>
        </div>

        <nav className="staff-layout__nav">
          <NavLink
            to="/staff"
            end
            className={getNavLinkClass}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/staff/clients"
            className={getNavLinkClass}
          >
            <Users size={19} />
            <span>Clients</span>
          </NavLink>

          <NavLink
            to="/staff/employees"
            className={getNavLinkClass}
          >
            <UserRoundCog size={19} />
            <span>Employees</span>
          </NavLink>

          <NavLink
            to="/staff/documents"
            className={getNavLinkClass}
          >
            <FileText size={19} />
            <span>Documents</span>
          </NavLink>
        </nav>

        <button
          type="button"
          className="staff-layout__logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="staff-layout__main">
        <Outlet />
      </main>
    </div>
  )
}