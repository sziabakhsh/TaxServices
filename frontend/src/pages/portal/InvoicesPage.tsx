import { Link } from 'react-router-dom'

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
  const {
    data: invoices,
    isLoading,
    isError,
  } = useMyInvoices()

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

  const sortedInvoices = [...(invoices ?? [])].sort(
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
                  to={`/portal/invoices/${invoice.id}`}
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