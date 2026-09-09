import { NavLink, Outlet } from 'react-router-dom'
import './ClientPortalLayout.css'

export default function ClientPortalLayout() {
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
            className={({ isActive }) =>
              isActive
                ? 'client-portal__nav-link client-portal__nav-link--active'
                : 'client-portal__nav-link'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/portal/profile"
            className={({ isActive }) =>
              isActive
                ? 'client-portal__nav-link client-portal__nav-link--active'
                : 'client-portal__nav-link'
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/portal/change-password"
            className={({ isActive }) =>
              isActive
                ? 'client-portal__nav-link client-portal__nav-link--active'
                : 'client-portal__nav-link'
            }
          >
            Change Password
          </NavLink>
          <NavLink
            to="/portal/cases"
            className={({ isActive }) =>
              isActive
                ? 'client-portal__nav-link client-portal__nav-link--active'
                : 'client-portal__nav-link'
            }
          >
            Tax Cases
          </NavLink>

          <NavLink
            to="/portal/documents"
            className={({ isActive }) =>
              isActive
                ? 'client-portal__nav-link client-portal__nav-link--active'
                : 'client-portal__nav-link'
            }
          >
            Documents
          </NavLink>
        </nav>
      </aside>

      <main className="client-portal__main">
        <Outlet />
      </main>
    </div>
  )
}