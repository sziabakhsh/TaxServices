import type { InvoiceItem } from '../../../features/invoices/invoice.types'
import { formatCurrency } from './invoiceFormatters'

export function InvoiceItemsTable({ items }: { items: InvoiceItem[] }) {
  return (
      <section className="staff-invoice-details__card">
        <h2>Invoice Items</h2>

        <div className="staff-invoice-details__table-wrapper">
          <table className="staff-invoice-details__table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map(
                (item) => (
                  <tr key={item.id}>
                    <td>
                      {item.description}
                    </td>

                    <td>
                      {item.serviceId
                        ? 'Service'
                        : 'Custom'}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      {formatCurrency(
                        item.unitPrice,
                      )}
                    </td>

                    <td>
                      {item.discountAmount > 0
                        ? formatCurrency(
                            item.discountAmount,
                          )
                        : '—'}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          item.amount,
                        )}
                      </strong>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
  )
}
