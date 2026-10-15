import { Link, useSearchParams } from 'react-router-dom'

import {
  InvoiceStatus,
  invoiceStatusLabels,
} from '../../features/invoices/invoice.types'
import { useMyInvoices } from '../../features/invoices/useInvoices'

import './InvoicesPage.css'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function getStatusClassName(
  status: InvoiceStatus,
) {
  switch (status) {
    case InvoiceStatus.Draft:
      return 'invoices-page__status invoices-page__status--draft'

    case InvoiceStatus.Issued:
      return 'invoices-page__status invoices-page__status--issued'

    case InvoiceStatus.Paid:
      return 'invoices-page__status invoices-page__status--paid'

    case InvoiceStatus.Overdue:
      return 'invoices-page__status invoices-page__status--overdue'

    case InvoiceStatus.Cancelled:
      return 'invoices-page__status invoices-page__status--cancelled'

    default:
      return 'invoices-page__status'
  }
}

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedStatus = searchParams.get('status') ?? 'all'
  const today = new Date().toISOString().slice(0, 10)
  const matchesStatus = (invoice: {status: InvoiceStatus; dueDate: string}) => {
    const overdue = invoice.status === InvoiceStatus.Overdue || (invoice.status === InvoiceStatus.Issued && invoice.dueDate.slice(0, 10) < today)
    switch (selectedStatus) {
      case 'paid': return invoice.status === InvoiceStatus.Paid
      case 'unpaid': return invoice.status === InvoiceStatus.Issued || overdue
      case 'overdue': return overdue
      case 'issued': return invoice.status === InvoiceStatus.Issued
      case 'draft': return invoice.status === InvoiceStatus.Draft
      case 'cancelled': return invoice.status === InvoiceStatus.Cancelled
      default: return true
    }
  }
  const returnPath = '/portal'
  const invoiceDetailsUrl = (id: string) => `/portal/invoices/${id}?returnTo=${encodeURIComponent(windowPath)}`
  const windowPath = `/portal/invoices${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const {
    data: invoices,
    isLoading,
    isError,
  } = useMyInvoices()

  const filteredInvoices = (invoices ?? []).filter(matchesStatus)

  if (isLoading) {
    return (
      <section className="invoices-page">
      <div className="invoices-page__container">
          <div className="invoices-page__state">
            Loading your invoices...
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="invoices-page">
        <div className="invoices-page__container">
          <div className="invoices-page__state invoices-page__state--error">
            We couldn't load your invoices.
          </div>
        </div>
      </section>
    )
  }

  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) =>
      new Date(b.issueDate).getTime() -
      new Date(a.issueDate).getTime(),
  )

  return (
    <section className="invoices-page">
      <div className="invoices-page__container">
        <span className="invoices-page__eyebrow">
          BILLING
        </span>

        <h1 className="invoices-page__title">
          Invoices
        </h1>

        <p className="invoices-page__description">
          Review your invoices, payment status,
          and billing details.
        </p>

        <div className="invoices-page__filters" aria-label="Invoice filters">
          <div className="invoices-page__filter-field">
            <label htmlFor="invoice-status-filter" className="invoices-page__filter-label">
              Status
            </label>
            <select
              id="invoice-status-filter"
              className="invoices-page__filter-select"
              value={selectedStatus}
              onChange={(event) => {
                const next = new URLSearchParams(searchParams)
                if (event.target.value === 'all') next.delete('status')
                else next.set('status', event.target.value)
                setSearchParams(next)
              }}
            >
              <option value="all">All invoices</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="issued">Issued</option>
            </select>
          </div>
          {searchParams.get('from') === 'dashboard' && (
            <Link to={returnPath} className="invoices-page__back-link">
              ← Back to Dashboard
            </Link>
          )}
        </div>

        {sortedInvoices.length === 0 ? (
          <div className="invoices-page__empty">
            <h2 className="invoices-page__empty-title">
              No invoices yet
            </h2>

            <p className="invoices-page__empty-text">
              You don't currently have any invoices
              associated with your account.
            </p>
          </div>
        ) : (
          <div className="invoices-page__list">
            {sortedInvoices.map((invoice) => (
              <article
                key={invoice.id}
                className="invoices-page__card"
              >
                <div className="invoices-page__card-header">
                  <div>
                    <span className="invoices-page__invoice-label">
                      Invoice
                    </span>

                    <h2 className="invoices-page__invoice-number">
                      {invoice.invoiceNumber}
                    </h2>
                  </div>

                  <span
                    className={getStatusClassName(
                      invoice.status,
                    )}
                  >
                    {
                      invoiceStatusLabels[
                        invoice.status
                      ]
                    }
                  </span>
                </div>

                <div className="invoices-page__details">
                  <div className="invoices-page__detail">
                    <span className="invoices-page__detail-label">
                      Issue Date
                    </span>

                    <strong className="invoices-page__detail-value">
                      {formatDate(invoice.issueDate)}
                    </strong>
                  </div>

                  <div className="invoices-page__detail">
                    <span className="invoices-page__detail-label">
                      Due Date
                    </span>

                    <strong className="invoices-page__detail-value">
                      {formatDate(invoice.dueDate)}
                    </strong>
                  </div>

                  <div className="invoices-page__detail">
                    <span className="invoices-page__detail-label">
                      Total
                    </span>

                    <strong className="invoices-page__detail-value invoices-page__amount">
                      {formatCurrency(
                        invoice.totalAmount,
                      )}
                    </strong>
                  </div>
                </div>

                <Link
                  to={invoiceDetailsUrl(invoice.id)}
                  className="invoices-page__details-link"
                >
                  View invoice
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}