interface Props { subtotal: number; taxRate: number; taxAmount: number; total: number }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value)
}

export default function InvoiceSummary({ subtotal, taxRate, taxAmount, total }: Props) {
  return (
        <div className="create-invoice-page__summary">
          <div>
            <span>Subtotal</span>

            <strong>
              {formatCurrency(
                subtotal
              )}
            </strong>
          </div>

          <div>
            <span>
              Tax ({taxRate || 0}%)
            </span>

            <strong>
              {formatCurrency(
                taxAmount
              )}
            </strong>
          </div>

          <div className="create-invoice-page__summary-total">
            <span>Total</span>

            <strong>
              {formatCurrency(
                total
              )}
            </strong>
          </div>
        </div>
  )
}
