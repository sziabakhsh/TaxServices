import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/http/api'
import './PaymentResultPage.css'

type Confirmation = 'checking' | 'paid' | 'pending' | 'error'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const [status, setStatus] = useState<Confirmation>('checking')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0

    const verify = async () => {
      try {
        const response = await api.get<{ status: number }>(
          '/payments/checkout/confirm',
          { params: { session_id: sessionId } },
        )
        if (cancelled) return
        if (response.data.status === 2) { // PaymentStatus.Succeeded
          setStatus('paid')
          return
        }
        setStatus('pending')
      } catch {
        if (cancelled) return
        setStatus('error')
      }
      if (!cancelled && ++attempts < 6) {
        timer = setTimeout(verify, 3000)
      }
    }

    void verify()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [sessionId])

  const confirmed = status === 'paid'
  return (
    <section className="payment-result">
      <div className="payment-result__container">
        <div className="payment-result__card">
          <div className="payment-result__icon payment-result__icon--success">{confirmed ? '✓' : '…'}</div>
          <span className="payment-result__eyebrow">PAYMENT</span>
          <h1 className="payment-result__title">
            {confirmed ? 'Payment confirmed' : status === 'checking' ? 'Verifying your payment' : 'Payment verification pending'}
          </h1>
          <p className="payment-result__text">
            {confirmed
              ? 'Your payment is confirmed and your invoice has been updated.'
              : 'We cannot confirm the payment yet. Please do not pay again. Check your invoices shortly or contact support if the status does not update.'}
          </p>
          <div className="payment-result__actions">
            <Link to="/portal/invoices" className="payment-result__button payment-result__button--primary">View Invoices</Link>
            <Link to="/portal" className="payment-result__button payment-result__button--secondary">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
