import { Link, useSearchParams } from 'react-router-dom'

import { useInvoices } from '../../features/invoices/useInvoices'
import {
  InvoiceStatus,
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
  const returnPath = '/staff'
  const invoiceDetailsUrl = (id: string) => `/staff/invoices/${id}?returnTo=${encodeURIComponent(windowPath)}`
  const windowPath = `/staff/invoices${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

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

  const invoices = (invoicesQuery.data ?? []).filter(matchesStatus)

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

      <div className="staff-invoices-page__filters">
        <label className="staff-invoices-page__filter-label" htmlFor="invoice-status-filter">Status</label>
        <select className="staff-invoices-page__filter-select" id="invoice-status-filter" value={selectedStatus} onChange={e => { const next = new URLSearchParams(searchParams); if(e.target.value === 'all') next.delete('status'); else next.set('status', e.target.value); setSearchParams(next) }}>
          <option value="all">All invoices</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="overdue">Overdue</option><option value="issued">Issued</option><option value="draft">Draft</option><option value="cancelled">Cancelled</option></select>
        {searchParams.get('from') === 'dashboard' && <Link className="staff-invoices-page__back" to={returnPath}>← Back to Dashboard</Link>}
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
                      to={invoiceDetailsUrl(invoice.id)}
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