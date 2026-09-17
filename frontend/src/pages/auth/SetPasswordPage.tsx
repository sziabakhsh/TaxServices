import { FormEvent, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'

import { useSetPassword } from '../../features/auth/useSetPassword'
import AuthLayout from './AuthLayout'
import './AuthForms.css'

export default function SetPasswordPage() {
  const [searchParams] = useSearchParams()

  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const setPasswordMutation = useSetPassword()

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (!email || !token) {
      return
    }

    if (password !== confirmPassword) {
      return
    }

    setPasswordMutation.mutate({
      email,
      token,
      password,
      confirmPassword,
    })
  }

  if (!email || !token) {
    return (
      <AuthLayout
        title="Invalid link"
        subtitle="This password setup link is invalid."
      >
        <div className="auth-form">
          <div
            role="alert"
            className="auth-form__error"
          >
            This password setup link is invalid.
          </div>

          <p className="auth-form__switch">
            <Link to="/login">
              Back to sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }

  if (setPasswordMutation.isSuccess) {
    return (
      <AuthLayout
        title="Password set"
        subtitle="Your password has been set successfully."
      >
        <div className="auth-form">
          <Link
            to="/login"
            className="brand-button auth-form__submit"
          >
            Go to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set your password"
      subtitle={`Create a password for ${email}.`}
    >
      <form
        onSubmit={handleSubmit}
        className="auth-form"
      >
        {setPasswordMutation.isError && (
          <div
            role="alert"
            className="auth-form__error"
          >
            Unable to set your password. The link may
            be invalid or expired.
          </div>
        )}

        <label className="field">
          Password

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
                setPassword(event.target.value)
              }
              placeholder="Create a password"
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
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
          Confirm Password

          <div className="auth-form__password">
            <input
              type={
                showConfirmPassword
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
              placeholder="Confirm your password"
              minLength={8}
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              className="auth-form__visibility"
              aria-label={
                showConfirmPassword
                  ? 'Hide password'
                  : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </label>

        {confirmPassword &&
          password !== confirmPassword && (
            <div
              role="alert"
              className="auth-form__error"
            >
              Passwords do not match.
            </div>
          )}

        <button
          type="submit"
          disabled={
            setPasswordMutation.isPending ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          className="brand-button auth-form__submit"
        >
          {setPasswordMutation.isPending
            ? 'Setting password…'
            : 'Set password'}
        </button>
      </form>
    </AuthLayout>
  )
}