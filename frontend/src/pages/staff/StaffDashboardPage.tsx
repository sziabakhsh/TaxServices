import { Link } from 'react-router-dom'
import {
  BriefcaseBusiness,
  FileText,
  Hourglass,
  UserRoundCheck,
  Users,
} from 'lucide-react'

import { CaseStatus } from '../../features/cases/case.types'
import { useStaffDashboard } from '../../features/dashboard/useStaffDashboard'

import './StaffDashboardPage.css'

function getStatusLabel(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft:
      return 'Draft'

    case CaseStatus.Open:
      return 'Open'

    case CaseStatus.InProgress:
      return 'In Progress'

    case CaseStatus.WaitingForClient:
      return 'Waiting for Client'

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
    case CaseStatus.Open:
      return 'staff-dashboard__status staff-dashboard__status--open'

    case CaseStatus.InProgress:
      return 'staff-dashboard__status staff-dashboard__status--progress'

    case CaseStatus.WaitingForClient:
      return 'staff-dashboard__status staff-dashboard__status--waiting'

    case CaseStatus.Completed:
      return 'staff-dashboard__status staff-dashboard__status--completed'

    case CaseStatus.Cancelled:
      return 'staff-dashboard__status staff-dashboard__status--cancelled'

    default:
      return 'staff-dashboard__status'
  }
}

const formatMoney = (amount: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount)

export default function StaffDashboardPage() {
  const {
    data: dashboard,
    isLoading,
    isError,
  } = useStaffDashboard()

  if (isError) {
    return (
      <div className="staff-dashboard">
        <div className="staff-dashboard__error">
          Unable to load dashboard information.
        </div>
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      <header className="staff-dashboard__header">
        <div>
          <p className="section-eyebrow">
            STAFF PORTAL
          </p>

          <h1 className="staff-dashboard__title">
            Dashboard
          </h1>

          <p className="staff-dashboard__subtitle">
            Overview of clients, tax cases,
            documents and employees.
          </p>
        </div>
      </header>

      <section
        className="staff-dashboard__summary"
        aria-label="Dashboard summary"
      >
        <Link
          to="/staff/clients"
          className="staff-dashboard__card"
        >
          <div className="staff-dashboard__card-icon">
            <Users size={22} />
          </div>

          <div>
            <p className="staff-dashboard__card-label">
              Total Clients
            </p>

            <p className="staff-dashboard__card-value">
              {isLoading
                ? '—'
                : dashboard?.totalClients ?? 0}
            </p>
          </div>
        </Link>

        <Link
          to="/staff/employees?status=active"
          className="staff-dashboard__card"
        >
          <div className="staff-dashboard__card-icon">
            <UserRoundCheck size={22} />
          </div>

          <div>
            <p className="staff-dashboard__card-label">
              Active Employees
            </p>

            <p className="staff-dashboard__card-value">
              {isLoading
                ? '—'
                : dashboard?.activeEmployees ?? 0}
            </p>
          </div>
        </Link>

        <Link
          to="/staff/cases?status=open"
          className="staff-dashboard__card"
        >
          <div className="staff-dashboard__card-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <div>
            <p className="staff-dashboard__card-label">
              Open Tax Cases
            </p>

            <p className="staff-dashboard__card-value">
              {isLoading
                ? '—'
                : dashboard?.openTaxCases ?? 0}
            </p>
          </div>
        </Link>

        <Link
          to="/staff/cases?status=waitingForClient"
          className="staff-dashboard__card"
        >
          <div className="staff-dashboard__card-icon">
            <Hourglass size={22} />
          </div>

          <div>
            <p className="staff-dashboard__card-label">
              Waiting for Client
            </p>

            <p className="staff-dashboard__card-value">
              {isLoading
                ? '—'
                : dashboard?.waitingForClientCases ?? 0}
            </p>
          </div>
        </Link>

        <article className="staff-dashboard__card">
          <div className="staff-dashboard__card-icon">
            <FileText size={22} />
          </div>

          <div>
            <p className="staff-dashboard__card-label">
              Documents
            </p>

            <p className="staff-dashboard__card-value">
              {isLoading
                ? '—'
                : dashboard?.totalDocuments ?? 0}
            </p>
          </div>
        </article>
      </section>

      {dashboard && !isLoading && (
        <section className="finance-panel" aria-label="Financial overview">
          <h2>Financial Overview</h2>
          <div className="finance-grid">
            <Link to="/staff/invoices?status=all&from=dashboard" className="finance-tile"><span>Total Invoiced</span><strong>{formatMoney(dashboard.totalInvoiced)}</strong></Link>
            <Link to="/staff/invoices?status=paid&from=dashboard" className="finance-tile"><span>Total Collected</span><strong>{formatMoney(dashboard.totalCollected)}</strong></Link>
            <Link to="/staff/invoices?status=unpaid&from=dashboard" className="finance-tile"><span>Outstanding Balance</span><strong>{formatMoney(dashboard.outstandingBalance)}</strong></Link>
            <Link to="/staff/invoices?status=overdue&from=dashboard" className="finance-tile"><span>Overdue Invoices</span><strong>{dashboard.overdueInvoices}</strong></Link>
          </div>
          <h3>Recent Invoices</h3>
          {dashboard.recentInvoices.length === 0 ? <p>No issued invoices yet.</p> : (
            <div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Invoice</th><th>Client</th><th>Total</th><th>Collected</th><th></th></tr></thead><tbody>
              {dashboard.recentInvoices.map(invoice => <tr key={invoice.id}><td>{invoice.invoiceNumber}</td><td>{invoice.clientName}</td><td>{formatMoney(invoice.totalAmount)}</td><td>{formatMoney(invoice.paidAmount)}</td><td><Link to={`/staff/invoices/${invoice.id}?returnTo=${encodeURIComponent("/staff")}`}>Details</Link></td></tr>)}
            </tbody></table></div>
          )}
        </section>
      )}

      <section className="staff-dashboard__recent">
        <div className="staff-dashboard__recent-header">
          <div>
            <h2 className="staff-dashboard__recent-title">
              Recent Tax Cases
            </h2>

            <p className="staff-dashboard__recent-subtitle">
              Recently opened client tax cases.
            </p>
          </div>

          <Link
            to="/staff/cases"
            className="staff-dashboard__view-all"
          >
            View All Cases
          </Link>
        </div>

        {isLoading && (
          <div className="staff-dashboard__recent-state">
            Loading recent tax cases...
          </div>
        )}

        {!isLoading &&
          dashboard?.recentTaxCases.length === 0 && (
            <div className="staff-dashboard__recent-state">
              No tax cases found.
            </div>
          )}

        {!isLoading &&
          dashboard &&
          dashboard.recentTaxCases.length > 0 && (
            <div className="staff-dashboard__table-wrapper">
              <table className="staff-dashboard__table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Tax Year</th>
                    <th>Status</th>
                    <th>Opened</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recentTaxCases.map(
                    (taxCase) => (
                      <tr key={taxCase.id}>
                        <td>
                          <strong>
                            {taxCase.clientName}
                          </strong>
                        </td>

                        <td>{taxCase.taxYear}</td>

                        <td>
                          <span
                            className={getStatusClassName(
                              taxCase.status
                            )}
                          >
                            {getStatusLabel(
                              taxCase.status
                            )}
                          </span>
                        </td>

                        <td>
                          {new Date(
                            taxCase.openedAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="staff-dashboard__table-action">
                          <Link
                            to={`/staff/cases/${taxCase.id}`}
                            className="staff-dashboard__view-case"
                          >
                            View Case
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  )
}