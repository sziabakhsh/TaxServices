import { Link } from 'react-router-dom'
import { CaseStatus } from '../../features/cases/case.types'
import { useMyClientProfile } from '../../features/clients/useMyClientProfile'
import { useClientDashboard } from '../../features/dashboard/useStaffDashboard'
import './PortalPage.css'

function getStatusLabel(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft:
      return 'Draft'

    case CaseStatus.Open:
      return 'Open'

    case CaseStatus.InProgress:
      return 'In Progress'

    case CaseStatus.WaitingForClient:
      return 'Waiting for You'

    case CaseStatus.Completed:
      return 'Completed'

    case CaseStatus.Cancelled:
      return 'Cancelled'

    default:
      return 'Unknown'
  }
}

function getStatusClassName(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft:
      return 'portal-dashboard__status portal-dashboard__status--draft'

    case CaseStatus.Open:
      return 'portal-dashboard__status portal-dashboard__status--open'

    case CaseStatus.InProgress:
      return 'portal-dashboard__status portal-dashboard__status--progress'

    case CaseStatus.WaitingForClient:
      return 'portal-dashboard__status portal-dashboard__status--waiting'

    case CaseStatus.Completed:
      return 'portal-dashboard__status portal-dashboard__status--completed'

    case CaseStatus.Cancelled:
      return 'portal-dashboard__status portal-dashboard__status--cancelled'

    default:
      return 'portal-dashboard__status'
  }
}

export default function PortalPage() {
  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useMyClientProfile()

  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useClientDashboard()

  if (isClientLoading || isDashboardLoading) {
    return (
      <section className="portal-dashboard">
        <div className="portal-dashboard__container">
          <div className="portal-dashboard__state">
            Loading your dashboard...
          </div>
        </div>
      </section>
    )
  }

  if (
    isClientError ||
    isDashboardError ||
    !client ||
    !dashboard
  ) {
    return (
      <section className="portal-dashboard">
        <div className="portal-dashboard__container">
          <div className="portal-dashboard__state portal-dashboard__state--error">
            We couldn't load your dashboard.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="portal-dashboard">
      <div className="portal-dashboard__container">
        <header className="portal-dashboard__header">
          <div>
            <span className="portal-dashboard__eyebrow">
              CLIENT PORTAL
            </span>

            <h1 className="portal-dashboard__title">
              Welcome, {client.firstName}
            </h1>

            <p className="portal-dashboard__description">
              Here's an overview of your tax services,
              documents and current cases.
            </p>
          </div>
        </header>

        <div className="portal-dashboard__summary">
          <Link
            to="/portal/cases"
            className="portal-dashboard__summary-card"
          >
            <span className="portal-dashboard__summary-label">
              Active Cases
            </span>

            <strong className="portal-dashboard__summary-value">
              {dashboard.activeTaxCases}
            </strong>

            <span className="portal-dashboard__summary-link">
              View cases
            </span>
          </Link>

          <Link
            to="/portal/cases"
            className="portal-dashboard__summary-card"
          >
            <span className="portal-dashboard__summary-label">
              Waiting for You
            </span>

            <strong className="portal-dashboard__summary-value">
              {dashboard.waitingForClientCases}
            </strong>

            <span className="portal-dashboard__summary-link">
              Review cases
            </span>
          </Link>

          <Link
            to="/portal/documents"
            className="portal-dashboard__summary-card"
          >
            <span className="portal-dashboard__summary-label">
              Documents
            </span>

            <strong className="portal-dashboard__summary-value">
              {dashboard.totalDocuments}
            </strong>

            <span className="portal-dashboard__summary-link">
              View documents
            </span>
          </Link>
        </div>

        <div className="portal-dashboard__content">
          <div className="portal-dashboard__recent">
            <div className="portal-dashboard__section-header">
              <div>
                <h2 className="portal-dashboard__section-title">
                  Recent Tax Cases
                </h2>

                <p className="portal-dashboard__section-description">
                  Your most recently opened tax service cases.
                </p>
              </div>

              <Link
                to="/portal/cases"
                className="portal-dashboard__section-link"
              >
                View all cases
              </Link>
            </div>

            {dashboard.recentTaxCases.length === 0 ? (
              <div className="portal-dashboard__empty">
                You don't have any tax cases yet.
              </div>
            ) : (
              <div className="portal-dashboard__case-list">
                {dashboard.recentTaxCases.map((taxCase) => (
                  <Link
                    key={taxCase.id}
                    to={`/portal/cases/${taxCase.id}`}
                    className="portal-dashboard__case"
                  >
                    <div className="portal-dashboard__case-main">
                      <strong className="portal-dashboard__case-service">
                        {taxCase.serviceName}
                      </strong>

                      <span className="portal-dashboard__case-year">
                        Tax Year {taxCase.taxYear}
                      </span>
                    </div>

                    <div className="portal-dashboard__case-meta">
                      <span
                        className={getStatusClassName(
                          taxCase.status
                        )}
                      >
                        {getStatusLabel(taxCase.status)}
                      </span>

                      <span className="portal-dashboard__case-date">
                        Opened{' '}
                        {new Date(
                          taxCase.openedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="portal-dashboard__quick-actions">
            <h2 className="portal-dashboard__section-title">
              Quick Actions
            </h2>

            <p className="portal-dashboard__section-description">
              Common actions for your account.
            </p>

            <div className="portal-dashboard__actions">
              <Link
                to="/portal/documents"
                className="portal-dashboard__action"
              >
                Upload a document
              </Link>

              <Link
                to="/portal/cases"
                className="portal-dashboard__action"
              >
                View tax cases
              </Link>

              <Link
                to="/portal/profile"
                className="portal-dashboard__action"
              >
                View profile
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}