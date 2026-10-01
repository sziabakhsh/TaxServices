import {
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { useAuth } from '../../features/auth/useAuth'
import type { CurrentUser } from '../../features/auth/auth.types'

import AuthLayout from './AuthLayout'
import './AuthForms.css'

export default function LoginPage() {
  const {
    login,
    verifyTwoFactor,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const [
    requiresTwoFactor,
    setRequiresTwoFactor,
  ] = useState(false)

  const [
    resendSeconds,
    setResendSeconds,
  ] = useState(0)

  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const from = (
    location.state as { from?: string } | null
  )?.from

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

  function navigateForUser(
    user: CurrentUser
  ) {
    const isStaff =
      user.roles.includes('Admin') ||
      user.roles.includes('Employee')

    const isClient =
      user.roles.includes('Client')

    let target: string

    if (
      isStaff &&
      from?.startsWith('/staff')
    ) {
      target = from
    } else if (
      isClient &&
      from?.startsWith('/portal')
    ) {
      target = from
    } else if (isStaff) {
      target = '/staff'
    } else {
      target = '/portal'
    }

    navigate(target, {
      replace: true,
    })
  }

  async function submitLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setBusy(true)

    try {
      const result = await login({
        email,
        password,
      })

      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true)
        setResendSeconds(60)
        return
      }

      if (!result.user) {
        throw new Error(
          'Authenticated user was not returned.'
        )
      }

      navigateForUser(result.user)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          'Invalid email or password.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function submitTwoFactor(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')
    setBusy(true)

    try {
      const user = await verifyTwoFactor({
        email,
        code,
      })

      navigateForUser(user)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          'Invalid or expired verification code.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function resendTwoFactorCode() {
    if (resendSeconds > 0) {
      return
    }

    setError('')
    setBusy(true)

    try {
      const result = await login({
        email,
        password,
      })

      if (!result.requiresTwoFactor) {
        if (result.user) {
          navigateForUser(result.user)
          return
        }

        throw new Error(
          'Unable to resend verification code.'
        )
      }

      setCode('')
      setResendSeconds(60)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          'We could not resend the verification code.'
      )
    } finally {
      setBusy(false)
    }
  }

  function backToLogin() {
    setRequiresTwoFactor(false)
    setCode('')
    setPassword('')
    setError('')
    setResendSeconds(0)
  }

  if (requiresTwoFactor) {
    return (
      <AuthLayout
        title="Verify your identity"
        subtitle={`We sent a verification code to ${email}.`}
      >
        <form
          onSubmit={submitTwoFactor}
          className="auth-form"
        >
          {error && (
            <div
              role="alert"
              className="auth-form__error"
            >
              {error}
            </div>
          )}

          <label className="field">
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

          <button
            type="submit"
            disabled={busy}
            className="brand-button auth-form__submit"
          >
            {busy
              ? 'Verifying…'
              : 'Verify'}
          </button>

          <div className="auth-form__actions">
            <button
              type="button"
              disabled={
                busy ||
                resendSeconds > 0
              }
              onClick={resendTwoFactorCode}
              className="auth-form__secondary"
            >
              {resendSeconds > 0
                ? `Resend code in ${resendSeconds}s`
                : 'Resend code'}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={backToLogin}
              className="auth-form__secondary"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your Amazing Accountant account."
    >
      <form
        onSubmit={submitLogin}
        className="auth-form"
      >
        {error && (
          <div
            role="alert"
            className="auth-form__error"
          >
            {error}
          </div>
        )}

        <label className="field">
          Email

          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field">
          Password

          <div className="auth-form__password">
            <input
              type={
                show
                  ? 'text'
                  : 'password'
              }
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Your password"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShow(!show)
              }
              className="auth-form__visibility"
              aria-label={
                show
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {show ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </label>

<div className="auth-form__forgot">
  <Link to="/forgot-password">
    Forgot password?
  </Link>
</div>
        <button
          type="submit"
          disabled={busy}
          className="brand-button auth-form__submit"
        >
          {busy
            ? 'Signing in…'
            : 'Sign in'}
        </button>

        <p className="auth-form__switch">
          Don't have an account?{' '}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}