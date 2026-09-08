import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import PortalSidebar from './PortalSidebar'
import './PortalLayout.css'

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const openSidebar = () => {
    setSidebarOpen(true)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="portal-layout">
      <aside className="portal-layout__desktop-sidebar">
        <PortalSidebar />
      </aside>

      {sidebarOpen && (
        <div className="portal-layout__mobile-sidebar">
          <button
            type="button"
            className="portal-layout__backdrop"
            aria-label="Close navigation"
            onClick={closeSidebar}
          />

          <div className="portal-layout__mobile-panel">
            <button
              type="button"
              className="portal-layout__close-button"
              aria-label="Close navigation"
              onClick={closeSidebar}
            >
              <X size={20} />
            </button>

            <PortalSidebar />
          </div>
        </div>
      )}

      <div className="portal-layout__content">
        <header className="portal-layout__mobile-header">
          <button
            type="button"
            className="portal-layout__menu-button"
            aria-label="Open navigation"
            onClick={openSidebar}
          >
            <Menu size={21} />
          </button>

          <span className="portal-layout__mobile-title">
            Client Portal
          </span>
        </header>

        <main className="portal-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
