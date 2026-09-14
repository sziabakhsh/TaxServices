import { Route, Routes, useParams } from 'react-router-dom'

import './App.css'

import HomePage from './pages/HomePage'
import AboutPage from './pages/public/AboutPage'
import ServicesPage from './pages/public/ServicesPage'
import ServiceDetailPage from './pages/public/ServiceDetailPage'
import ContactPage from './pages/public/ContactPage'
import FaqPage from './pages/public/FaqPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import PortalPage from './pages/portal/PortalPage'

import ProtectedRoute from './components/ProtectedRoute'
import ClientPortalLayout from './layouts/ClientPortalLayout/ClientPortalLayout'
import ProfilePage from './pages/portal/ProfilePage'
import CasesPage from './pages/portal/CasesPage'
import CaseDetailsPage from './pages/portal/CaseDetailsPage'
import ChangePasswordPage from './pages/portal/ChangePasswordPage'
import DocumentsPage from './pages/portal/DocumentsPage'

import StaffPortalLayout from './layouts/StaffPortalLayout/StaffPortalLayout'
import ClientsPage from './pages/staff/ClientsPage'
import StaffClientDocumentsPage from './pages/staff/StaffClientDocumentsPage'
import StaffClientCasesPage from './pages/staff/StaffClientCasesPage'
import StaffTaxCaseDetailsPage from './pages/staff/StaffTaxCaseDetailsPage'

function SimplePage({ title }: { title: string }) {
  return (
    <div className="simple-page">
      <h1 className="simple-page__title">{title}</h1>

      <p className="simple-page__text">
        This public page is reserved for the next content pass.
      </p>
    </div>
  )
}

function ServiceDetailRoute() {
  const { slug = 'individual-tax' } = useParams()

  return <ServiceDetailPage slug={slug} />
}

function RolePlaceholder({ title }: { title: string }) {
  return (
    <main className="role-placeholder">
      <div className="role-placeholder__content">
        <p className="section-eyebrow role-placeholder__eyebrow">
          AUTHENTICATED AREA
        </p>

        <h1 className="section-title">
          {title}
        </h1>

        <p className="section-copy role-placeholder__copy">
          The authenticated foundation is ready. This area will be
          implemented in the next dashboard phase.
        </p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:slug" element={<ServiceDetailRoute />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/privacy" element={<SimplePage title="Privacy Policy" />} />
      <Route path="/terms" element={<SimplePage title="Terms of Service" />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Client portal */}
        {/* <Route path="/portal" element={<ClientPortalLayout />}>
          <Route index element={<PortalPage />} />
        </Route> */}
        <Route path="/portal" element={<ClientPortalLayout />}>
          <Route index element={<PortalPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="/portal/cases/:id" element={<CaseDetailsPage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          
        </Route>

        {/* Staff portal */}
        {/* <Route
          path="/staff"
          element={<RolePlaceholder title="Staff Portal" />}
        /> */}
        <Route element={<ProtectedRoute />}>
          <Route path="/staff" element={<StaffPortalLayout />}>
            <Route
              index
              element={<SimplePage title="Staff Dashboard" />}
            />

            <Route
              path="clients"
              element={<ClientsPage />}
            />

            <Route
              path="documents"
              element={<SimplePage title="Documents" />}
            />

            <Route
              path="clients/:clientId/documents"
              element={<StaffClientDocumentsPage />}
            />

            <Route
              path="clients/:clientId/cases"
              element={<StaffClientCasesPage />}
            />

            <Route
              path="cases/:id"
              element={<StaffTaxCaseDetailsPage />}
            />
          </Route>
        </Route>
        {/* Admin portal */}
        <Route
          path="/admin"
          element={<RolePlaceholder title="Admin Portal" />}
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}