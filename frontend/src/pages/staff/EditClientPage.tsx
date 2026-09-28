import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { useClient } from '../../features/clients/useClient'
import { useUpdateClient } from '../../features/clients/useUpdateClient'

import './CreateClientPage.css'

export default function EditClientPage() {
  const navigate = useNavigate()

  const { clientId } = useParams<{
    clientId: string
  }>()

  const {
    data: client,
    isLoading,
    isError,
  } = useClient(clientId)

  const updateClient = useUpdateClient(
    clientId ?? ''
  )

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    sin: '',
    dateOfBirth: '',
    address: '',
  })

  const [error, setError] = useState('')

  useEffect(() => {
    if (!client) {
      return
    }

    setForm({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phoneNumber:
        client.phoneNumber ?? '',
      sin: '',
      dateOfBirth:
        client.individualProfile
          ?.dateOfBirth
          ?.slice(0, 10) ?? '',
      address:
        client.individualProfile
          ?.address ?? '',
    })
  }, [client])

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

    if (!clientId) {
      return
    }

    setError('')

    if (
      form.sin &&
      !/^\d{9}$/.test(form.sin)
    ) {
      setError(
        'SIN must contain exactly 9 digits.'
      )

      return
    }

    try {
      await updateClient.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,

        individualProfile: {
          sin: form.sin,
          dateOfBirth:
            form.dateOfBirth || null,
          address: form.address,
        },
      })

      // Do not keep the entered SIN
      // in browser state after saving.
      setForm(current => ({
        ...current,
        sin: '',
      }))

      navigate('/staff/clients', {
        replace: true,
      })
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'We could not update the client. Please check the information and try again.'
      )
    }
  }

  if (isLoading) {
    return (
      <section className="create-client-page">
        Loading client...
      </section>
    )
  }

  if (isError || !client) {
    return (
      <section className="create-client-page">
        <div className="create-client-page__error">
          We couldn't load the client.
        </div>

        <Link
          to="/staff/clients"
          className="create-client-page__back"
        >
          Back to Clients
        </Link>
      </section>
    )
  }

  return (
    <section className="create-client-page">
      <div className="create-client-page__header">
        <div>
          <span className="create-client-page__eyebrow">
            CLIENT MANAGEMENT
          </span>

          <h1>
            Edit Client
          </h1>

          <p>
            Update client and individual
            profile information.
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
                disabled={
                  updateClient.isPending
                }
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
                disabled={
                  updateClient.isPending
                }
                required
              />
            </label>

            <label className="create-client-page__field">
              Email

              <input
                type="email"
                value={form.email}
                readOnly
                disabled={
                  updateClient.isPending
                }
              />

              <span className="create-client-page__hint">
                Email changes are managed
                separately.
              </span>
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
                disabled={
                  updateClient.isPending
                }
              />
            </label>
          </div>
        </div>

        <div className="create-client-page__section">
          <h2>Individual Profile</h2>

          <div className="create-client-page__grid">
            <label className="create-client-page__field">
              Current SIN

              <input
                type="text"
                value={
                  client.individualProfile
                    ?.maskedSIN ??
                  'Not provided'
                }
                readOnly
              />

              <span className="create-client-page__hint">
                The full SIN is never
                displayed.
              </span>
            </label>

            <label className="create-client-page__field">
              New SIN

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
                disabled={
                  updateClient.isPending
                }
              />

              <span className="create-client-page__hint">
                Leave blank to keep the
                current SIN.
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
                disabled={
                  updateClient.isPending
                }
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
                disabled={
                  updateClient.isPending
                }
              />
            </label>
          </div>
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
            disabled={
              updateClient.isPending
            }
          >
            {updateClient.isPending
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  )
}