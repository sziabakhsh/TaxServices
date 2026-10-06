import { Link } from 'react-router-dom'

import './PaymentResultPage.css'

export default function PaymentSuccessPage() {
  return (
    <section className="payment-result">
      <div className="payment-result__container">
        <div className="payment-result__card">
          <div className="payment-result__icon payment-result__icon--success">
            ✓
          </div>

          <span className="payment-result__eyebrow">
            PAYMENT
          </span>

          <h1 className="payment-result__title">
            Payment submitted
          </h1>

          <p className="payment-result__text">
            Your payment was submitted successfully.
            It may take a moment for the payment status
            to update.
          </p>

          <div className="payment-result__actions">
            <Link
              to="/portal/invoices"
              className="payment-result__button payment-result__button--primary"
            >
              View Invoices
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