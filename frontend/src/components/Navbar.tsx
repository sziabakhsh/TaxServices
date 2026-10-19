import { ChevronDown, Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import './Navbar.css'

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const portalPath = user?.roles.includes('Admin')
    ? '/admin'
    : user?.roles.includes('Employee')
      ? '/staff'
      : '/portal'

  
  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/', { replace: true })
  }
  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar__inner section-shell">
        <Link to="/" onClick={close} className="navbar__brand" aria-label="Amazing Accountant and Tax Services home">
          <img src="/amazing-logo.png" alt="Amazing Accountant and Tax Services" className="navbar__logo" />
        </Link>

        <nav className="navbar__nav" aria-label="Primary navigation">
          <Link className="navbar__link navbar__link--active" to="/">Home</Link>
          <Link className="navbar__link" to="/about">About Us</Link>
          <Link className="navbar__link navbar__link--with-icon" to="/services">Services <ChevronDown size={15} /></Link>
          <Link className="navbar__link navbar__link--with-icon" to="/faq">Resources <ChevronDown size={15} /></Link>
          <Link className="navbar__link" to="/faq">FAQ</Link>
          <Link className="navbar__link" to="/contact">Contact</Link>
        </nav>

        <div className="navbar__actions">
          <button className="navbar__search" aria-label="Search"><Search size={21} /></button>
          {!isLoading && (isAuthenticated ? (
            <>
              <Link to={portalPath} className="navbar__register">Portal</Link>
              <button type="button" onClick={handleLogout} className="navbar__login">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__login">Login</Link>
              <Link to="/register" className="navbar__register">Register</Link>
            </>
          ))}
        </div>

        <button onClick={() => setOpen(!open)} className="navbar__menu-button" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="navbar__mobile-panel">
          <nav className="navbar__mobile-nav section-shell" aria-label="Mobile navigation">
            <Link onClick={close} className="navbar__mobile-link" to="/">Home</Link>
            <Link onClick={close} className="navbar__mobile-link" to="/about">About Us</Link>
            <Link onClick={close} className="navbar__mobile-link" to="/services">Services</Link>
            <Link onClick={close} className="navbar__mobile-link" to="/faq">Resources & FAQ</Link>
            <Link onClick={close} className="navbar__mobile-link" to="/contact">Contact</Link>
            <div className="navbar__mobile-actions">
              {!isLoading && (isAuthenticated ? (
                <>
                  <Link onClick={close} to={portalPath} className="navbar__register navbar__register--mobile">Portal</Link>
                  <button type="button" onClick={handleLogout} className="navbar__login navbar__login--mobile">Logout</button>
                </>
              ) : (
                <>
                  <Link onClick={close} to="/login" className="navbar__login navbar__login--mobile">Login</Link>
                  <Link onClick={close} to="/register" className="navbar__register navbar__register--mobile">Register</Link>
                </>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
