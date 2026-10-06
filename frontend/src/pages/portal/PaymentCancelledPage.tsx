import { Link } from 'react-router-dom'

import './PaymentResultPage.css'

export default function PaymentCancelledPage() {
  return (
    <section className="payment-result">
      <div className="payment-result__container">
        <div className="payment-result__card">
          <div className="payment-result__icon payment-result__icon--cancelled">
            ×
          </div>

          <span className="payment-result__eyebrow">
            PAYMENT
          </span>

          <h1 className="payment-result__title">
            Payment cancelled
          </h1>

          <p className="payment-result__text">
            Your payment was not completed.
            No online payment has been recorded.
          </p>

          <div className="payment-result__actions">
            <Link
              to="/portal/invoices"
              className="payment-result__button payment-result__button--primary"
            >
              Back to Invoices
            </Link>

            <Link
              to="/portal"
              className="payment-result__button payment-result__button--secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}