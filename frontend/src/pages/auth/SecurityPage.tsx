import {
  useEffect,
  useState,
} from 'react'
import {
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'

import {
  useConfirmDisableTwoFactor,
  useConfirmEnableTwoFactor,
  useRequestDisableTwoFactor,
  useRequestEnableTwoFactor,
  useTwoFactorStatus,
} from '../../features/auth/useTwoFactor'

import './SecurityPage.css'

type PendingAction =
  | 'enable'
  | 'disable'
  | null

export default function SecurityPage() {
  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null)

  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0)

  const {
    data,
    isLoading,
    isError,
  } = useTwoFactorStatus()

  const requestEnable =
    useRequestEnableTwoFactor()

  const confirmEnable =
    useConfirmEnableTwoFactor()

  const requestDisable =
    useRequestDisableTwoFactor()

  const confirmDisable =
    useConfirmDisableTwoFactor()

  const isBusy =
    requestEnable.isPending ||
    confirmEnable.isPending ||
    requestDisable.isPending ||
    confirmDisable.isPending

  useEffect(() => {
    if (resendSeconds <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setResendSeconds((current) => {
        if (current <= 1) {
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [resendSeconds])

  function getErrorMessage(
    err: any,
    fallback: string
  ) {
    return (
      err?.response?.data?.detail ??
      err?.response?.data?.message ??
      err?.message ??
      fallback
    )
  }

  async function handleEnable() {
    setError('')
    setMessage('')
    setCode('')

    try {
      await requestEnable.mutateAsync()

      setPendingAction('enable')
      setResendSeconds(60)

      setMessage(
        'We sent a verification code to your email address.'
      )
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          'We could not send the verification code.'
        )
      )
    }
  }

  async function handleDisable() {
    setError('')
    setMessage('')
    setCode('')

    try {
      await requestDisable.mutateAsync()

      setPendingAction('disable')
      setResendSeconds(60)

      setMessage(
        'We sent a verification code to your email address.'
      )
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          'We could not send the verification code.'
        )
      )
    }
  }

  async function handleConfirm(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!pendingAction) {
      return
    }

    setError('')
    setMessage('')

    try {
      if (pendingAction === 'enable') {
        await confirmEnable.mutateAsync({
          code,
        })

        setMessage(
          'Two-factor authentication is now enabled.'
        )
      } else {
        await confirmDisable.mutateAsync({
          code,
        })

        setMessage(
          'Two-factor authentication is now disabled.'
        )
      }

      setPendingAction(null)
      setCode('')
      setResendSeconds(0)
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          'The verification code is invalid or has expired.'
        )
      )
    }
  }

  async function handleResend() {
    if (
      !pendingAction ||
      resendSeconds > 0
    ) {
      return
    }

    setError('')
    setMessage('')
    setCode('')

    try {
      if (pendingAction === 'enable') {
        await requestEnable.mutateAsync()
      } else {
        await requestDisable.mutateAsync()
      }

      setResendSeconds(60)

      setMessage(
        'A new verification code was sent to your email address.'
      )
    } catch (err: any) {
      setError(
        getErrorMessage(
          err,
          'We could not resend the verification code.'
        )
      )
    }
  }

  function handleCancel() {
    setPendingAction(null)
    setCode('')
    setError('')
    setMessage('')
    setResendSeconds(0)
  }

  if (isLoading) {
    return (
      <div className="security-page">
        <p>
          Loading security settings…
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="security-page">
        <div className="security-page__error">
          We could not load your security settings.
        </div>
      </div>
    )
  }

  return (
    <div className="security-page">
      <header className="security-page__header">
        <p className="security-page__eyebrow">
          ACCOUNT SECURITY
        </p>

        <h1>Security</h1>

        <p>
          Manage additional protection for your
          account.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="security-page__error"
        >
          {error}
        </div>
      )}

      {message && (
        <div className="security-page__message">
          <CheckCircle2 size={19} />

          <span>{message}</span>
        </div>
      )}

      <section className="security-page__card">
        <div className="security-page__card-heading">
          <div className="security-page__icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h2>
              Two-Factor Authentication
            </h2>

            <p>
              Add an extra verification step when
              signing in to your account.
            </p>
          </div>
        </div>

        <div className="security-page__status-row">
          <span>Status</span>

          <span
            className={
              data.isEnabled
                ? 'security-page__status security-page__status--enabled'
                : 'security-page__status security-page__status--disabled'
            }
          >
            {data.isEnabled
              ? 'Enabled'
              : 'Disabled'}
          </span>
        </div>

        {!pendingAction && (
          <div className="security-page__action">
            {data.isEnabled ? (
              <button
                type="button"
                className="security-page__secondary-button"
                disabled={isBusy}
                onClick={handleDisable}
              >
                {requestDisable.isPending
                  ? 'Sending code…'
                  : 'Disable two-factor authentication'}
              </button>
            ) : (
              <button
                type="button"
                className="brand-button"
                disabled={isBusy}
                onClick={handleEnable}
              >
                {requestEnable.isPending
                  ? 'Sending code…'
                  : 'Enable two-factor authentication'}
              </button>
            )}
          </div>
        )}

        {pendingAction && (
          <form
            className="security-page__verification"
            onSubmit={handleConfirm}
          >
            <div className="security-page__verification-heading">
              <KeyRound size={20} />

              <div>
                <strong>
                  Enter verification code
                </strong>

                <p>
                  Enter the code we sent to your
                  email address.
                </p>
              </div>
            </div>

            <label className="security-page__field">
              Verification code

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="Enter verification code"
                required
                autoFocus
              />
            </label>

            <div className="security-page__buttons">
              <button
                type="submit"
                className="brand-button"
                disabled={isBusy}
              >
                {confirmEnable.isPending ||
                confirmDisable.isPending
                  ? 'Verifying…'
                  : pendingAction === 'enable'
                    ? 'Enable 2FA'
                    : 'Disable 2FA'}
              </button>

              <button
                type="button"
                className="security-page__secondary-button"
                disabled={
                  isBusy ||
                  resendSeconds > 0
                }
                onClick={handleResend}
              >
                {requestEnable.isPending ||
                requestDisable.isPending
                  ? 'Sending…'
                  : resendSeconds > 0
                    ? `Resend code in ${resendSeconds}s`
                    : 'Resend code'}
              </button>

              <button
                type="button"
                className="security-page__secondary-button"
                disabled={isBusy}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}