import {
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useCreateClient } from '../../features/clients/useClients'

import './CreateClientPage.css'

export default function CreateClientPage() {
  const navigate = useNavigate()

  const createClient = useCreateClient()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    sin: '',
    dateOfBirth: '',
    address: '',
    isActive: true,
  })

  const [error, setError] = useState('')

  const update =
    (key: keyof typeof form) =>
    (value: string | boolean) => {
      setForm(current => ({
        ...current,
        [key]: value,
      }))
    }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (
      form.sin.length !== 9 ||
      !/^\d{9}$/.test(form.sin)
    ) {
      setError(
        'SIN must contain exactly 9 digits.'
      )
      return
    }

    try {
      await createClient.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        isActive: form.isActive,

        individualProfile: {
          sin: form.sin,
          dateOfBirth:
            form.dateOfBirth || null,
          address: form.address,
        },
      })

      navigate('/staff/clients', {
        replace: true,
      })
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'We could not create the client. Please check the information and try again.'
      )
    }
  }

  return (
    <section className="create-client-page">
      <div className="create-client-page__header">
        <div>
          <span className="create-client-page__eyebrow">
            CLIENT MANAGEMENT
          </span>

          <h1>New Client</h1>

          <p>
            Create a new client account and
            individual profile.
          </p>
        </div>

        <Link
          to="/staff/clients"
          className="create-client-page__back"
        >
          Back to Clients
        </Link>
      </div>

      <form
        className="create-client-page__form"
        onSubmit={submit}
      >
        {error && (
          <div
            className="create-client-page__error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="create-client-page__section">
          <h2>Client Information</h2>

          <div className="create-client-page__grid">
            <label className="create-client-page__field">
              First Name
              <input
                type="text"
                value={form.firstName}
                onChange={event =>
                  update('firstName')(
                    event.target.value
                  )
                }
                maxLength={100}
                disabled={createClient.isPending}
                required
              />
            </label>

            <label className="create-client-page__field">
              Last Name
              <input
                type="text"
                value={form.lastName}
                onChange={event =>
                  update('lastName')(
                    event.target.value
                  )
                }
                maxLength={100}
                disabled={createClient.isPending}
                required
              />
            </label>

            <label className="create-client-page__field">
              Email
              <input
                type="email"
                value={form.email}
                onChange={event =>
                  update('email')(
                    event.target.value
                  )
                }
                maxLength={255}
                disabled={createClient.isPending}
                required
              />
            </label>

            <label className="create-client-page__field">
              Phone Number
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={event =>
                  update('phoneNumber')(
                    event.target.value
                  )
                }
                maxLength={30}
                disabled={createClient.isPending}
              />
            </label>
          </div>
        </div>

        <div className="create-client-page__section">
          <h2>Individual Profile</h2>

          <div className="create-client-page__grid">
            <label className="create-client-page__field">
              SIN
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={form.sin}
                onChange={event =>
                  update('sin')(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 9)
                  )
                }
                maxLength={9}
                disabled={createClient.isPending}
                required
              />

              <span className="create-client-page__hint">
                Enter exactly 9 digits.
              </span>
            </label>

            <label className="create-client-page__field">
              Date of Birth
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={event =>
                  update('dateOfBirth')(
                    event.target.value
                  )
                }
                disabled={createClient.isPending}
              />
            </label>

            <label className="create-client-page__field create-client-page__field--full">
              Address
              <textarea
                value={form.address}
                onChange={event =>
                  update('address')(
                    event.target.value
                  )
                }
                maxLength={500}
                rows={4}
                disabled={createClient.isPending}
              />
            </label>
          </div>
        </div>

        <div className="create-client-page__section">
          <label className="create-client-page__checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={event =>
                update('isActive')(
                  event.target.checked
                )
              }
              disabled={createClient.isPending}
            />

            <span>Client is active</span>
          </label>
        </div>

        <div className="create-client-page__footer">
          <Link
            to="/staff/clients"
            className="create-client-page__cancel"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="create-client-page__submit"
            disabled={createClient.isPending}
          >
            {createClient.isPending
              ? 'Creating Client...'
              : 'Create Client'}
          </button>
        </div>
      </form>
    </section>
  )
}