import { Link } from 'react-router-dom'

import { useInvoices } from '../../features/invoices/useInvoices'
import {
  invoiceStatusLabels,
} from '../../features/invoices/invoice.types'

import './StaffInvoicesPage.css'

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

export default function StaffInvoicesPage() {
  const invoicesQuery = useInvoices()

  if (invoicesQuery.isLoading) {
    return (
      <div className="staff-invoices-page">
        <p>Loading invoices...</p>
      </div>
    )
  }

  if (invoicesQuery.isError) {
    return (
      <div className="staff-invoices-page">
        <div className="staff-invoices-page__error">
          Unable to load invoices.
        </div>
      </div>
    )
  }

  const invoices = invoicesQuery.data ?? []

  return (
    <div className="staff-invoices-page">
      <div className="staff-invoices-page__header">
        <div>
          <h1>Invoices</h1>
          <p>
            Create and manage client invoices.
          </p>
        </div>

        <Link
          to="/staff/invoices/new"
          className="staff-invoices-page__create"
        >
          Create Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="staff-invoices-page__empty">
          <h2>No invoices yet</h2>
          <p>
            Create your first invoice to get started.
          </p>

          <Link
            to="/staff/invoices/new"
            className="staff-invoices-page__create"
          >
            Create Invoice
          </Link>
        </div>
      ) : (
        <div className="staff-invoices-page__table-wrapper">
          <table className="staff-invoices-page__table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <strong>
                      {invoice.invoiceNumber}
                    </strong>
                  </td>

                  <td>
                    {formatDate(invoice.issueDate)}
                  </td>

                  <td>
                    {formatDate(invoice.dueDate)}
                  </td>

                  <td>
                    {formatCurrency(
                      invoice.totalAmount,
                    )}
                  </td>

                  <td>
                    <span
                      className={`staff-invoices-page__status staff-invoices-page__status--${invoice.status}`}
                    >
                      {
                        invoiceStatusLabels[
                          invoice.status
                        ]
                      }
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/staff/invoices/${invoice.id}`}
                      className="staff-invoices-page__action"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}