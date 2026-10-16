import type { Invoice } from '../../../features/invoices/invoice.types'
import { invoiceStatusLabels } from '../../../features/invoices/invoice.types'
import { formatDate } from './invoiceFormatters'

export function InvoiceInformation({ invoice }: { invoice: Invoice }) {
  return (
      <section className="staff-invoice-details__card">
        <h2>Invoice Information</h2>

        <div className="staff-invoice-details__info-grid">
          <div>
            <span className="staff-invoice-details__label">
              Invoice Number
            </span>

            <strong>
              {invoice.invoiceNumber}
            </strong>
          </div>

        <div>
            <span className="staff-invoice-details__label">
                Client
            </span>

            <strong>
                {invoice.clientName}
            </strong>

            <div className="staff-invoice-details__client-email">
                {invoice.clientEmail}
            </div>
        </div>

          <div>
            <span className="staff-invoice-details__label">
              Issue Date
            </span>

            <strong>
              {formatDate(
                invoice.issueDate,
              )}
            </strong>
          </div>

          <div>
            <span className="staff-invoice-details__label">
              Due Date
            </span>

            <strong>
              {formatDate(
                invoice.dueDate,
              )}
            </strong>
          </div>

          <div>
            <span className="staff-invoice-details__label">
              Tax Rate
            </span>

            <strong>
              {invoice.taxRate}%
            </strong>
          </div>

          <div>
            <span className="staff-invoice-details__label">
              Status
            </span>

            <strong>
              {
                invoiceStatusLabels[
                  invoice.status
                ]
              }
            </strong>
          </div>
        </div>

        {invoice.notes && (
          <div className="staff-invoice-details__notes">
            <span className="staff-invoice-details__label">
              Notes
            </span>

            <p>{invoice.notes}</p>
          </div>
        )}
      </section>
  )
}
