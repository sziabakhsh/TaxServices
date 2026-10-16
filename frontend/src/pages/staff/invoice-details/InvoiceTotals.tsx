import type { Invoice } from '../../../features/invoices/invoice.types'
import { formatCurrency } from './invoiceFormatters'

export function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  return (
      <section className="staff-invoice-details__totals">
        <div>
          <span>Subtotal</span>

          <strong>
            {formatCurrency(
              invoice.subtotal,
            )}
          </strong>
        </div>

        <div>
          <span>
            Tax ({invoice.taxRate}%)
          </span>

          <strong>
            {formatCurrency(
              invoice.taxAmount,
            )}
          </strong>
        </div>

        <div className="staff-invoice-details__total">
          <span>Total</span>

          <strong>
            {formatCurrency(
              invoice.totalAmount,
            )}
          </strong>
        </div>
      </section>
  )
}
