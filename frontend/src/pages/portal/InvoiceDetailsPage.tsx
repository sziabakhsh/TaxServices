import { Link, useParams } from 'react-router-dom'

import {
  InvoiceStatus,
  invoiceStatusLabels,
} from '../../features/invoices/invoice.types'
import { useMyInvoice } from '../../features/invoices/useInvoices'

import { PaymentStatus } from '../../features/payments/payment.types'
import { useMyPayments,
    useCreateCheckoutSession
 } from '../../features/payments/usePayments'

import './InvoiceDetailsPage.css'

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

function getStatusClassName(status: InvoiceStatus) {
  switch (status) {
    case InvoiceStatus.Draft:
      return 'invoice-details__status invoice-details__status--draft'

    case InvoiceStatus.Issued:
      return 'invoice-details__status invoice-details__status--issued'

    case InvoiceStatus.Paid:
      return 'invoice-details__status invoice-details__status--paid'

    case InvoiceStatus.Overdue:
      return 'invoice-details__status invoice-details__status--overdue'

    case InvoiceStatus.Cancelled:
      return 'invoice-details__status invoice-details__status--cancelled'

    default:
      return 'invoice-details__status'
  }
}

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: invoice,
    isLoading,
    isError,
  } = useMyInvoice(id)

  const {
    data: payments,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useMyPayments()

  const checkoutMutation = useCreateCheckoutSession()
  
  if (isLoading) {
    return (
      <section className="invoice-details">
        <div className="invoice-details__container">
          <div className="invoice-details__state">
            Loading invoice...
          </div>
        </div>
      </section>
    )
  }

  if (isError || !invoice) {
    return (
      <section className="invoice-details">
        <div className="invoice-details__container">
          <Link
            to="/portal/invoices"
            className="invoice-details__back"
          >
            ← Back to invoices
          </Link>

          <div className="invoice-details__state invoice-details__state--error">
            We couldn't load this invoice.
          </div>
        </div>
      </section>
    )
  }

  // From this point forward, invoice is guaranteed to exist.

  const invoicePayments = (payments ?? []).filter(
    payment => payment.invoiceId === invoice.id,
  )

  const succeededPayments = invoicePayments.filter(
    payment =>
      payment.status === PaymentStatus.Succeeded,
  )

  const paidAmount = succeededPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  )

  const remainingAmount = Math.max(
    0,
    invoice.totalAmount - paidAmount,
  )

const canPayOnline =
  invoice.status === InvoiceStatus.Issued &&
  remainingAmount > 0

async function handlePayOnline() {
  if (
    !invoice ||
    !canPayOnline ||
    remainingAmount <= 0
  ) {
    return
  }

  try {
    const result =
      await checkoutMutation.mutateAsync({
        invoiceId: invoice.id,
        amount: remainingAmount,
      })

    window.location.href = result.checkoutUrl
  } catch (error) {
    console.error(
      'Failed to create Stripe Checkout session:',
      error,
    )
  }
}

return (
    <section className="invoice-details">
      <div className="invoice-details__container">
        <Link
          to="/portal/invoices"
          className="invoice-details__back"
        >
          ← Back to invoices
        </Link>

        <div className="invoice-details__header">
          <div>
            <span className="invoice-details__eyebrow">
              INVOICE
            </span>

            <h1 className="invoice-details__title">
              {invoice.invoiceNumber}
            </h1>
          </div>

          <span
            className={getStatusClassName(
              invoice.status,
            )}
          >
            {invoiceStatusLabels[invoice.status]}
          </span>
        </div>

        {/* Invoice Information */}

        <div className="invoice-details__card">
          <div className="invoice-details__info-grid">
            <div>
              <span className="invoice-details__label">
                Issue Date
              </span>

              <strong className="invoice-details__value">
                {formatDate(invoice.issueDate)}
              </strong>
            </div>

            <div>
              <span className="invoice-details__label">
                Due Date
              </span>

              <strong className="invoice-details__value">
                {formatDate(invoice.dueDate)}
              </strong>
            </div>
          </div>
        </div>

        {/* Services */}

        <div className="invoice-details__card">
          <h2 className="invoice-details__section-title">
            Services
          </h2>

          <div className="invoice-details__table-wrapper">
            <table className="invoice-details__table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.description}</td>

                    <td>{item.quantity}</td>

                    <td>
                      {formatCurrency(
                        item.unitPrice,
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        item.discountAmount,
                      )}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(
                          item.amount,
                        )}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="invoice-details__totals">
            <div className="invoice-details__total-row">
              <span>Subtotal</span>

              <strong>
                {formatCurrency(invoice.subtotal)}
              </strong>
            </div>

            <div className="invoice-details__total-row">
              <span>
                Tax ({invoice.taxRate}%)
              </span>

              <strong>
                {formatCurrency(invoice.taxAmount)}
              </strong>
            </div>

            <div className="invoice-details__total-row invoice-details__total-row--grand">
              <span>Total</span>

              <strong>
                {formatCurrency(
                  invoice.totalAmount,
                )}
              </strong>
            </div>
          </div>
        </div>

        {/* Payment Summary */}

        <div className="invoice-details__card">
          <div className="invoice-details__payment-header">
            <h2 className="invoice-details__section-title invoice-details__section-title--no-margin">
              Payment Summary
            </h2>

            {canPayOnline && (
              <button
  type="button"
  className="invoice-details__pay-button"
  onClick={handlePayOnline}
  disabled={checkoutMutation.isPending}
>
  {checkoutMutation.isPending
    ? 'Redirecting...'
    : `Pay ${formatCurrency(remainingAmount)}`}
</button>
            )}
          </div>

          {paymentsLoading ? (
            <div className="invoice-details__payment-state">
              Loading payment information...
            </div>
          ) : paymentsError ? (
            <div className="invoice-details__payment-state invoice-details__payment-state--error">
              We couldn't load your payment information.
            </div>
          ) : (
            <div className="invoice-details__payment-summary">
              <div className="invoice-details__payment-row">
                <span>Total</span>

                <strong>
                  {formatCurrency(
                    invoice.totalAmount,
                  )}
                </strong>
              </div>

              <div className="invoice-details__payment-row">
                <span>Paid</span>

                <strong>
                  {formatCurrency(paidAmount)}
                </strong>
              </div>

              <div className="invoice-details__payment-row invoice-details__payment-row--remaining">
                <span>Remaining</span>

                <strong>
                  {formatCurrency(
                    remainingAmount,
                  )}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}

        {invoice.notes && (
          <div className="invoice-details__card">
            <h2 className="invoice-details__section-title">
              Notes
            </h2>

            <p className="invoice-details__notes">
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}