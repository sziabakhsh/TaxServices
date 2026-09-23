import { useState } from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRoundCog,
  Users,
  X,
} from 'lucide-react'

import { useAuth } from '../../features/auth/useAuth'
import './StaffPortalLayout.css'

export default function StaffPortalLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

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

  function handleNavigation() {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="staff-layout">
      <header className="staff-layout__mobile-header">
        <NavLink
          to="/"
          className="staff-layout__mobile-brand"
        >
          <img
            src="/amazing-logo.png"
            alt="Amazing Accountant and Tax Services"
            className="staff-layout__mobile-logo"
          />
        </NavLink>

        <button
          type="button"
          className="staff-layout__menu-button"
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

      {isMobileMenuOpen && (
        <button
          type="button"
          className="staff-layout__overlay"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={
          isMobileMenuOpen
            ? 'staff-layout__sidebar staff-layout__sidebar--open'
            : 'staff-layout__sidebar'
        }
      >
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
            onClick={handleNavigation}
          >
            <LayoutDashboard size={19} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/staff/clients"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <Users size={19} />
            <span>Clients</span>
          </NavLink>

          <NavLink
            to="/staff/employees"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <UserRoundCog size={19} />
            <span>Employees</span>
          </NavLink>

          <NavLink
            to="/staff/documents"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <FileText size={19} />
            <span>Documents</span>
          </NavLink>

          <NavLink
            to="/staff/services"
            className={getNavLinkClass}
            onClick={handleNavigation}
          >
            <BriefcaseBusiness size={19} />
            <span>Services</span>
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
