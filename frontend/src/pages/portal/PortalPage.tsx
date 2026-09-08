import { useMyClientProfile } from '../../features/clients/useMyClientProfile'
import './PortalPage.css'

export default function PortalPage() {
  const {
    data: client,
    isLoading,
    isError,
  } = useMyClientProfile()

  if (isLoading) {
    return (
      <section className="portal-dashboard">
        <div className="portal-dashboard__container">
          <div className="portal-dashboard__state">
            Loading your account...
          </div>
        </div>
      </section>
    )
  }

  if (isError || !client) {
    return (
      <section className="portal-dashboard">
        <div className="portal-dashboard__container">
          <div className="portal-dashboard__state portal-dashboard__state--error">
            We couldn't load your client information.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="portal-dashboard">
      <div className="portal-dashboard__container">
        <span className="portal-dashboard__eyebrow">
          CLIENT PORTAL
        </span>

        <h1 className="portal-dashboard__title">
          Welcome, {client.firstName}
        </h1>

        <p className="portal-dashboard__description">
          Manage your tax services, cases, documents and account
          information from your client portal.
        </p>

        <div className="portal-dashboard__account-card">
          <div className="portal-dashboard__account-item">
            <span className="portal-dashboard__account-label">
              Name
            </span>

            <strong className="portal-dashboard__account-value">
              {client.firstName} {client.lastName}
            </strong>
          </div>

          <div className="portal-dashboard__account-item">
            <span className="portal-dashboard__account-label">
              Email
            </span>

            <strong className="portal-dashboard__account-value">
              {client.email}
            </strong>
          </div>

          <div className="portal-dashboard__account-item">
            <span className="portal-dashboard__account-label">
              Phone
            </span>

            <strong className="portal-dashboard__account-value">
              {client.phoneNumber || 'Not provided'}
            </strong>
          </div>

          <div className="portal-dashboard__account-item">
            <span className="portal-dashboard__account-label">
              Account status
            </span>

            <strong
              className={
                client.isActive
                  ? 'portal-dashboard__status portal-dashboard__status--active'
                  : 'portal-dashboard__status portal-dashboard__status--inactive'
              }
            >
              {client.isActive ? 'Active' : 'Inactive'}
            </strong>
          </div>
        </div>
      </div>
    </section>
  )
}