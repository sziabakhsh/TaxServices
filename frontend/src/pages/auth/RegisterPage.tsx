import {
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../features/auth/useAuth'
import AuthLayout from './AuthLayout'

import './AuthForms.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const submittingRef = useRef(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update =
    (key: keyof typeof form) =>
    (value: string) => {
      setForm(current => ({
        ...current,
        [key]: value,
      }))
    }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (submittingRef.current) {
      return
    }

    setError('')

    if (form.password !== form.confirmPassword) {
      setError(
        'Password and confirm password do not match.'
      )
      return
    }

    submittingRef.current = true
    setBusy(true)

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      })

      navigate('/portal', {
        replace: true,
      })
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'We could not create your account. Please check your information and try again.'
      )

      submittingRef.current = false
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your secure client account with Amazing Accountant and Tax Services."
    >
      <form
        onSubmit={submit}
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

        <div className="auth-form__row">
          <label className="field">
            First name

            <input
              value={form.firstName}
              onChange={event =>
                update('firstName')(
                  event.target.value
                )
              }
              autoComplete="given-name"
              maxLength={100}
              disabled={busy}
              required
            />
          </label>

          <label className="field">
            Last name

            <input
              value={form.lastName}
              onChange={event =>
                update('lastName')(
                  event.target.value
                )
              }
              autoComplete="family-name"
              maxLength={100}
              disabled={busy}
              required
            />
          </label>
        </div>

        <label className="field">
          Email

          <input
            type="email"
            value={form.email}
            onChange={event =>
              update('email')(
                event.target.value
              )
            }
            autoComplete="email"
            maxLength={255}
            placeholder="you@example.com"
            disabled={busy}
            required
          />
        </label>

        <label className="field">
          Phone number{' '}
          <span className="auth-form__optional">
            (optional)
          </span>

          <input
            type="tel"
            value={form.phoneNumber}
            onChange={event =>
              update('phoneNumber')(
                event.target.value
              )
            }
            autoComplete="tel"
            maxLength={30}
            disabled={busy}
          />
        </label>

        <label className="field">
          Password

          <input
            type="password"
            value={form.password}
            onChange={event =>
              update('password')(
                event.target.value
              )
            }
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
            required
          />
        </label>

        <label className="field">
          Confirm password

          <input
            type="password"
            value={form.confirmPassword}
            onChange={event =>
              update('confirmPassword')(
                event.target.value
              )
            }
            autoComplete="new-password"
            minLength={8}
            disabled={busy}
            required
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="brand-button auth-form__submit"
        >
          {busy
            ? 'Creating account…'
            : 'Create account'}
        </button>

        <p className="auth-form__switch">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}