import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../features/auth/useAuth'
import './ClientPortalLayout.css'

export default function ClientPortalLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const getNavLinkClass = ({
    isActive,
  }: {
    isActive: boolean
  }) =>
    isActive
      ? 'client-portal__nav-link client-portal__nav-link--active'
      : 'client-portal__nav-link'

  function handleLogout() {
    logout()
    navigate('/', { replace: true })

  }

  return (
    <div className="client-portal">
      <aside className="client-portal__sidebar">
        <div className="client-portal__brand">
          <span className="client-portal__brand-eyebrow">
            TAX SERVICES
          </span>

          <strong className="client-portal__brand-title">
            Client Portal
          </strong>
        </div>

        <nav className="client-portal__nav">
          <NavLink
            to="/portal"
            end
            className={getNavLinkClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/portal/profile"
            className={getNavLinkClass}
          >
            Profile
          </NavLink>

          <NavLink
            to="/portal/change-password"
            className={getNavLinkClass}
          >
            Change Password
          </NavLink>

          <NavLink
            to="/portal/cases"
            className={getNavLinkClass}
          >
            Tax Cases
          </NavLink>

          <NavLink
            to="/portal/documents"
            className={getNavLinkClass}
          >
            Documents
          </NavLink>
        </nav>

        <button
          type="button"
          className="client-portal__logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </aside>

      <main className="client-portal__main">
        <Outlet />
      </main>
    </div>
  )
}
