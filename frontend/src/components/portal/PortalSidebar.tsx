import {
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import './PortalSidebar.css'

export default function PortalSidebar() {
  const { user, logout } = useAuth()

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'portal-sidebar__link portal-sidebar__link--active'
      : 'portal-sidebar__link'

  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar__logo-section">
        <NavLink to="/" className="portal-sidebar__logo-link">
          <img
            src="/amazing-logo.png"
            alt="Amazing Accountant and Tax Services"
            className="portal-sidebar__logo"
          />
        </NavLink>
      </div>

      <div className="portal-sidebar__user-section">
        <div className="portal-sidebar__user-card">
          <div className="portal-sidebar__avatar">
            <UserRound size={21} />
          </div>

          <div className="portal-sidebar__user-info">
            <div className="portal-sidebar__user-name">
              {user?.firstName} {user?.lastName}
            </div>

            <div className="portal-sidebar__user-email">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <nav className="portal-sidebar__nav">
        <NavLink
          to="/portal"
          end
          className={getNavLinkClass}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/portal/profile"
          className={getNavLinkClass}
        >
          <UserRound size={19} />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/portal/cases"
          className={getNavLinkClass}
        >
          <FolderOpen size={19} />
          <span>Tax Cases</span>
        </NavLink>

        <NavLink
          to="/portal/documents"
          className={getNavLinkClass}
        >
          <FileText size={19} />
          <span>Documents</span>
        </NavLink>

        <NavLink
          to="/portal/settings"
          className={getNavLinkClass}
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="portal-sidebar__footer">
        <button
          type="button"
          className="portal-sidebar__logout"
          onClick={logout}
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
