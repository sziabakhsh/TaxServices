import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { useForgotPassword } from '../../features/auth/useForgotPassword'

import AuthLayout from './AuthLayout'
import './AuthForms.css'

export default function ForgotPasswordPage() {
  const forgotPasswordMutation =
    useForgotPassword()

  const [email, setEmail] = useState('')
  const [validationError, setValidationError] =
    useState('')
  const [successMessage, setSuccessMessage] =
    useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setValidationError('')
    setSuccessMessage('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setValidationError(
        'Please enter your email address.'
      )
      return
    }

    try {
      await forgotPasswordMutation.mutateAsync({
        email: normalizedEmail,
      })

      setSuccessMessage(
        'If an account exists for this email, a password reset link has been sent.'
      )
    } catch {
      // Error is rendered from mutation state below.
    }
  }

  function getServerError() {
    if (!forgotPasswordMutation.error) {
      return ''
    }

    if (
      axios.isAxiosError(
        forgotPasswordMutation.error
      )
    ) {
      return (
        forgotPasswordMutation.error.response
          ?.data?.detail ??
        'We could not process your request. Please try again.'
      )
    }

    return 'We could not process your request. Please try again.'
  }

  const serverError = getServerError()

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
        {validationError && (
          <div
            role="alert"
            className="auth-form__error"
          >
            {validationError}
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            className="auth-form__error"
          >
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="auth-form__success">
            {successMessage}
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
            disabled={
              forgotPasswordMutation.isPending
            }
          />
        </label>

        <button
          type="submit"
          disabled={
            forgotPasswordMutation.isPending
          }
          className="brand-button auth-form__submit"
        >
          {forgotPasswordMutation.isPending
            ? 'Sending…'
            : 'Send reset link'}
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