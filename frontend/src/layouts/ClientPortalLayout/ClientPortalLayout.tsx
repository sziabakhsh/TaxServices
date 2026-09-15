import { useState } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import {
  FileText,
  FolderOpen,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from 'lucide-react'

import { useAuth } from '../../features/auth/useAuth'
import './ClientPortalLayout.css'

export default function ClientPortalLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

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

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="client-portal">
      {/* Mobile Header */}

      <header className="client-portal__mobile-header">
        <div className="client-portal__mobile-brand">
          <span className="client-portal__mobile-eyebrow">
            TAX SERVICES
          </span>

          <strong className="client-portal__mobile-title">
            Client Portal
          </strong>
        </div>

        <button
          type="button"
          className="client-portal__menu-button"
          aria-label={
            isMobileMenuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={isMobileMenuOpen}
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
        >
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </header>

      {/* Mobile Overlay */}

      {isMobileMenuOpen && (
        <button
          type="button"
          className="client-portal__overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={
          isMobileMenuOpen
            ? 'client-portal__sidebar client-portal__sidebar--open'
            : 'client-portal__sidebar'
        }
      >
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
            onClick={handleNavigation}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/portal/profile"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <UserRound size={19} />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/portal/change-password"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <KeyRound size={19} />
            <span>Change Password</span>
          </NavLink>

          <NavLink
            to="/portal/cases"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <FolderOpen size={19} />
            <span>Tax Cases</span>
          </NavLink>

          <NavLink
            to="/portal/documents"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <FileText size={19} />
            <span>Documents</span>
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

      {/* Page Content */}

      <main className="client-portal__main">
        <Outlet />
      </main>
    </div>
  )
}
