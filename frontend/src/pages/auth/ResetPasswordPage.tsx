import { FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { setPassword } from '../../features/auth/auth.api'

import AuthLayout from './AuthLayout'
import './AuthForms.css'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const [password, setPasswordValue] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasValidLink =
    email.trim() !== '' &&
    token.trim() !== ''

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (!hasValidLink) {
      setError(
        'This password reset link is invalid.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    setBusy(true)

    try {
      await setPassword({
        email,
        token,
        password,
        confirmPassword
      })

      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'The password reset link is invalid or has expired.'
      )
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Password reset"
        subtitle="Your password has been changed successfully."
      >
        <div className="auth-form">
          <div className="auth-form__success">
            Your new password is ready to use.
          </div>

          <Link
            to="/login"
            className="brand-button auth-form__submit"
          >
            Sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter a new password for your account."
    >
      <form
        onSubmit={handleSubmit}
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

        {!hasValidLink && (
          <div className="auth-form__error">
            This password reset link is incomplete
            or invalid.
          </div>
        )}

        <label className="field">
          New password

          <div className="auth-form__password">
            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPasswordValue(
                  event.target.value
                )
              }
              placeholder="New password"
              required
              disabled={!hasValidLink || busy}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current
                )
              }
              className="auth-form__visibility"
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </label>

        <label className="field">
          Confirm password

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Confirm new password"
            required
            disabled={!hasValidLink || busy}
          />
        </label>

        <button
          type="submit"
          disabled={!hasValidLink || busy}
          className="brand-button auth-form__submit"
        >
          {busy
            ? 'Resetting…'
            : 'Reset password'}
        </button>

        <p className="auth-form__switch">
          <Link to="/login">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}