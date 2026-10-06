import { useState } from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import ConfirmModal from '../../components/common/ConfirmModal'

import {
  InvoiceStatus,
  invoiceStatusLabels,
} from '../../features/invoices/invoice.types'
import {
  useCancelInvoice,
  useInvoice,
  useIssueInvoice,
} from '../../features/invoices/useInvoices'

import {
  PaymentMethod,
  PaymentStatus,
  paymentMethodLabels,
  paymentStatusLabels,
} from '../../features/payments/payment.types'
import {
  useInvoicePayments,
  useRecordManualPayment,
} from '../../features/payments/usePayments'

import './StaffInvoiceDetailsPage.css'

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string
            message?: string
          }
        }
      }
    ).response

    return (
      response?.data?.detail ??
      response?.data?.message ??
      'Something went wrong.'
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export default function StaffInvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const invoiceQuery = useInvoice(id)

  const paymentsQuery =
    useInvoicePayments(id)

  const issueInvoiceMutation =
    useIssueInvoice()

  const cancelInvoiceMutation =
    useCancelInvoice()

  const recordPaymentMutation =
    useRecordManualPayment(id ?? '')

  const [actionError, setActionError] =
    useState<string | null>(null)

  const [showIssueModal, setShowIssueModal] =
    useState(false)

    const [showCancelModal, setShowCancelModal] =
    useState(false)

  const [showPaymentForm, setShowPaymentForm] =
    useState(false)

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      PaymentMethod.InteracETransfer,
    )

  const [paymentAmount, setPaymentAmount] =
    useState('')

  const [paymentReference, setPaymentReference] =
    useState('')

  const [paymentNotes, setPaymentNotes] =
    useState('')

  const [paymentError, setPaymentError] =
    useState<string | null>(null)

  if (!id) {
    return (
      <div className="staff-invoice-details">
        <div className="staff-invoice-details__error">
          Invalid invoice.
        </div>
      </div>
    )
  }

  if (invoiceQuery.isLoading) {
    return (
      <div className="staff-invoice-details">
        <p>Loading invoice...</p>
      </div>
    )
  }

  if (
    invoiceQuery.isError ||
    !invoiceQuery.data
  ) {
    return (
      <div className="staff-invoice-details">
        <div className="staff-invoice-details__error">
          Unable to load invoice.
        </div>

        <Link
          to="/staff/invoices"
          className="staff-invoice-details__back"
        >
          Back to Invoices
        </Link>
      </div>
    )
  }

  const invoice = invoiceQuery.data
  const payments = paymentsQuery.data ?? []

  const succeededPayments = payments.filter(
    (payment) =>
      payment.status ===
      PaymentStatus.Succeeded,
  )

  const paidAmount = succeededPayments.reduce(
    (total, payment) =>
      total + payment.amount,
    0,
  )

  const remainingAmount = Math.max(
    invoice.totalAmount - paidAmount,
    0,
  )

  const isActionPending =
    issueInvoiceMutation.isPending ||
    cancelInvoiceMutation.isPending

  const canRecordPayment =
    invoice.status === InvoiceStatus.Issued &&
    remainingAmount > 0

  async function handleIssueInvoice() {
    setActionError(null)

    try {
        await issueInvoiceMutation.mutateAsync(
        invoice.id,
        )

        setShowIssueModal(false)
    } catch (error) {
        setActionError(
        getErrorMessage(error),
        )
    }
  }
  
  async function handleCancelInvoice() {
  setActionError(null)

  try {
    await cancelInvoiceMutation.mutateAsync(
      invoice.id,
    )

    setShowCancelModal(false)
  } catch (error) {
    setActionError(
      getErrorMessage(error),
    )
  }
}


  function handleOpenPaymentForm() {
    setPaymentError(null)

    setPaymentAmount(
      remainingAmount.toFixed(2),
    )

    setPaymentMethod(
      PaymentMethod.InteracETransfer,
    )

    setPaymentReference('')
    setPaymentNotes('')
    setShowPaymentForm(true)
  }

  function handleClosePaymentForm() {
    if (recordPaymentMutation.isPending) {
      return
    }

    setShowPaymentForm(false)
    setPaymentError(null)
  }

  async function handleRecordPayment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPaymentError(null)

    const amount = Number(paymentAmount)

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setPaymentError(
        'Payment amount must be greater than zero.',
      )
      return
    }

    if (amount > remainingAmount) {
      setPaymentError(
        `Payment cannot exceed the remaining balance of ${formatCurrency(
          remainingAmount,
        )}.`,
      )
      return
    }

    if (
      paymentMethod !==
        PaymentMethod.InteracETransfer &&
      paymentMethod !== PaymentMethod.Cash
    ) {
      setPaymentError(
        'Please select a valid manual payment method.',
      )
      return
    }

    try {
      await recordPaymentMutation.mutateAsync({
        invoiceId: invoice.id,
        amount,
        method: paymentMethod,
        reference:
          paymentReference.trim() || null,
        notes:
          paymentNotes.trim() || null,
      })

      setShowPaymentForm(false)
      setPaymentAmount('')
      setPaymentReference('')
      setPaymentNotes('')
    } catch (error) {
      setPaymentError(
        getErrorMessage(error),
      )
    }
  }

  return (
    <div className="staff-invoice-details">
      <div className="staff-invoice-details__header">
        <div>
          <Link
            to="/staff/invoices"
            className="staff-invoice-details__back"
          >
            ← Back to Invoices
          </Link>

          <div className="staff-invoice-details__title-row">
            <h1>
              {invoice.invoiceNumber}
            </h1>

            <span
              className={`staff-invoice-details__status staff-invoice-details__status--${invoice.status}`}
            >
              {
                invoiceStatusLabels[
                  invoice.status
                ]
              }
            </span>
          </div>
        </div>

        <div className="staff-invoice-details__actions">
          {invoice.status ===
            InvoiceStatus.Draft && (
            <button
              type="button"
              className="staff-invoice-details__button staff-invoice-details__button--primary"
              onClick={() =>
                setShowIssueModal(true)
              }
              disabled={isActionPending}
            >
              {issueInvoiceMutation.isPending
                ? 'Issuing...'
                : 'Issue Invoice'}
            </button>
          )}

          {(invoice.status ===
            InvoiceStatus.Draft ||
            invoice.status ===
              InvoiceStatus.Issued) && (
            <button
              type="button"
              className="staff-invoice-details__button staff-invoice-details__button--danger"
              onClick={() =>
                setShowCancelModal(true)
              }
              disabled={isActionPending}
            >
              {cancelInvoiceMutation.isPending
                ? 'Cancelling...'
                : 'Cancel Invoice'}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="staff-invoice-details__error">
          {actionError}
        </div>
      )}

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
              {invoice.items.map(
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

      <section className="staff-invoice-details__card">
        <div className="staff-invoice-details__section-header">
          <div>
            <h2>Payments</h2>
            <p>
              Payment history and remaining balance.
            </p>
          </div>

          {canRecordPayment &&
            !showPaymentForm && (
              <button
                type="button"
                className="staff-invoice-details__button staff-invoice-details__button--primary"
                onClick={
                  handleOpenPaymentForm
                }
              >
                Record Payment
              </button>
            )}
        </div>

        <div className="staff-invoice-details__payment-summary">
          <div>
            <span>Total</span>
            <strong>
              {formatCurrency(
                invoice.totalAmount,
              )}
            </strong>
          </div>

          <div>
            <span>Paid</span>
            <strong>
              {formatCurrency(
                paidAmount,
              )}
            </strong>
          </div>

          <div>
            <span>Remaining</span>
            <strong>
              {formatCurrency(
                remainingAmount,
              )}
            </strong>
          </div>
        </div>

        {showPaymentForm && (
          <form
            className="staff-invoice-details__payment-form"
            onSubmit={
              handleRecordPayment
            }
          >
            <h3>Record Payment</h3>

            {paymentError && (
              <div className="staff-invoice-details__error">
                {paymentError}
              </div>
            )}

            <div className="staff-invoice-details__payment-form-grid">
              <label>
                <span>Method</span>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      Number(
                        event.target.value,
                      ) as PaymentMethod,
                    )
                  }
                  disabled={
                    recordPaymentMutation.isPending
                  }
                >
                  <option
                    value={
                      PaymentMethod.InteracETransfer
                    }
                  >
                    Interac e-Transfer
                  </option>

                  <option
                    value={
                      PaymentMethod.Cash
                    }
                  >
                    Cash
                  </option>
                </select>
              </label>

              <label>
                <span>Amount</span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={remainingAmount}
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(
                      event.target.value,
                    )
                  }
                  disabled={
                    recordPaymentMutation.isPending
                  }
                  required
                />
              </label>

              <label>
                <span>
                  Reference
                </span>

                <input
                  type="text"
                  value={
                    paymentReference
                  }
                  onChange={(event) =>
                    setPaymentReference(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  disabled={
                    recordPaymentMutation.isPending
                  }
                />
              </label>

              <label>
                <span>Notes</span>

                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(event) =>
                    setPaymentNotes(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  disabled={
                    recordPaymentMutation.isPending
                  }
                />
              </label>
            </div>

            <div className="staff-invoice-details__payment-form-actions">
              <button
                type="button"
                className="staff-invoice-details__button"
                onClick={
                  handleClosePaymentForm
                }
                disabled={
                  recordPaymentMutation.isPending
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="staff-invoice-details__button staff-invoice-details__button--primary"
                disabled={
                  recordPaymentMutation.isPending
                }
              >
                {recordPaymentMutation.isPending
                  ? 'Recording...'
                  : 'Record Payment'}
              </button>
            </div>
          </form>
        )}

        {paymentsQuery.isLoading ? (
          <p>Loading payments...</p>
        ) : paymentsQuery.isError ? (
          <div className="staff-invoice-details__error">
            Unable to load payments.
          </div>
        ) : payments.length === 0 ? (
          <div className="staff-invoice-details__empty">
            No payments have been recorded yet.
          </div>
        ) : (
          <div className="staff-invoice-details__table-wrapper">
            <table className="staff-invoice-details__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Reference</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>
                {payments.map(
                  (payment) => (
                    <tr key={payment.id}>
                      <td>
                        {formatDateTime(
                          payment.paidAt ??
                            payment.createdAt,
                        )}
                      </td>

                      <td>
                        {
                          paymentMethodLabels[
                            payment.method
                          ]
                        }
                      </td>

                      <td>
                        <span
                          className={`staff-invoice-details__payment-status staff-invoice-details__payment-status--${payment.status}`}
                        >
                          {
                            paymentStatusLabels[
                              payment.status
                            ]
                          }
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            payment.amount,
                          )}
                        </strong>
                      </td>

                      <td>
                        {payment.reference ||
                          '—'}
                      </td>

                      <td>
                        {payment.notes ||
                          '—'}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={showIssueModal}
        title="Issue Invoice?"
        message={`Are you sure you want to issue ${invoice.invoiceNumber}? Once issued, the invoice can receive payments.`}
        confirmText="Issue Invoice"
        cancelText="Keep Draft"
        isPending={issueInvoiceMutation.isPending}
        variant="primary"
        onConfirm={handleIssueInvoice}
        onCancel={() =>
            setShowIssueModal(false)
        }
        />

        <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Invoice?"
        message={`Are you sure you want to cancel ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmText="Cancel Invoice"
        cancelText="Keep Invoice"
        isPending={cancelInvoiceMutation.isPending}
        variant="danger"
        onConfirm={handleCancelInvoice}
        onCancel={() =>
            setShowCancelModal(false)
        }
        />
    </div>
  )
}