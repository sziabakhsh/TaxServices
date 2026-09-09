import { FormEvent, useEffect, useState } from 'react'
import { useMyClientProfile } from '../../features/clients/useMyClientProfile'
import { useUpdateMyClientProfile } from '../../features/clients/useUpdateMyClientProfile'
import './ProfilePage.css'

export default function ProfilePage() {
  const {
    data: client,
    isLoading,
    isError,
  } = useMyClientProfile()

  const updateProfile = useUpdateMyClientProfile()

  const [isEditing, setIsEditing] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!client) {
      return
    }

    setFirstName(client.firstName)
    setLastName(client.lastName)
    setPhoneNumber(client.phoneNumber ?? '')
    setDateOfBirth(
      client.individualProfile?.dateOfBirth
        ? client.individualProfile.dateOfBirth.slice(0, 10)
        : '',
    )
    setAddress(client.individualProfile?.address ?? '')
  }, [client])

  function handleCancel() {
    if (!client) {
      return
    }

    setFirstName(client.firstName)
    setLastName(client.lastName)
    setPhoneNumber(client.phoneNumber ?? '')
    setDateOfBirth(
      client.individualProfile?.dateOfBirth
        ? client.individualProfile.dateOfBirth.slice(0, 10)
        : '',
    )
    setAddress(client.individualProfile?.address ?? '')

    updateProfile.reset()
    setIsEditing(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!client) {
      return
    }

    updateProfile.mutate(
      {
        firstName,
        lastName,
        email: client.email,
        phoneNumber,
        individualProfile: {
          dateOfBirth: dateOfBirth || null,
          address,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-page__container">
          <div className="profile-page__state">
            Loading your profile...
          </div>
        </div>
      </section>
    )
  }

  if (isError || !client) {
    return (
      <section className="profile-page">
        <div className="profile-page__container">
          <div className="profile-page__state profile-page__state--error">
            We couldn't load your profile information.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="profile-page">
      <div className="profile-page__container">
        <div className="profile-page__header">
          <div>
            <span className="profile-page__eyebrow">
              MY ACCOUNT
            </span>

            <h1 className="profile-page__title">
              Profile
            </h1>

            <p className="profile-page__description">
              Review and manage your personal information.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              className="profile-page__edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form
            className="profile-page__form"
            onSubmit={handleSubmit}
          >
            <div className="profile-page__form-grid">
              <div className="profile-page__form-field">
                <label
                  className="profile-page__form-label"
                  htmlFor="firstName"
                >
                  First name
                </label>

                <input
                  id="firstName"
                  className="profile-page__input"
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="profile-page__form-field">
                <label
                  className="profile-page__form-label"
                  htmlFor="lastName"
                >
                  Last name
                </label>

                <input
                  id="lastName"
                  className="profile-page__input"
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="profile-page__form-field">
                <label
                  className="profile-page__form-label"
                  htmlFor="email"
                >
                  Email
                </label>

                <input
                  id="email"
                  className="profile-page__input profile-page__input--readonly"
                  type="email"
                  value={client.email}
                  readOnly
                />

                <span className="profile-page__field-hint">
                  Email changes are managed separately.
                </span>
              </div>

              <div className="profile-page__form-field">
                <label
                  className="profile-page__form-label"
                  htmlFor="phoneNumber"
                >
                  Phone
                </label>

                <input
                  id="phoneNumber"
                  className="profile-page__input"
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value)
                  }
                  maxLength={30}
                />
              </div>

              <div className="profile-page__form-field">
                <label
                  className="profile-page__form-label"
                  htmlFor="dateOfBirth"
                >
                  Date of birth
                </label>

                <input
                  id="dateOfBirth"
                  className="profile-page__input"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                />
              </div>

              <div className="profile-page__form-field profile-page__form-field--wide">
                <label
                  className="profile-page__form-label"
                  htmlFor="address"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  className="profile-page__textarea"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  maxLength={500}
                  rows={4}
                />
              </div>
            </div>

            {updateProfile.isError && (
              <div className="profile-page__message profile-page__message--error">
                We couldn't update your profile. Please try again.
              </div>
            )}

            <div className="profile-page__form-actions">
              <button
                type="button"
                className="profile-page__cancel-button"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-page__save-button"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending
                  ? 'Saving...'
                  : 'Save changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-page__card">
            <div className="profile-page__field">
              <span className="profile-page__label">
                First name
              </span>

              <strong className="profile-page__value">
                {client.firstName}
              </strong>
            </div>

            <div className="profile-page__field">
              <span className="profile-page__label">
                Last name
              </span>

              <strong className="profile-page__value">
                {client.lastName}
              </strong>
            </div>

            <div className="profile-page__field">
              <span className="profile-page__label">
                Email
              </span>

              <strong className="profile-page__value">
                {client.email}
              </strong>
            </div>

            <div className="profile-page__field">
              <span className="profile-page__label">
                Phone
              </span>

              <strong className="profile-page__value">
                {client.phoneNumber || 'Not provided'}
              </strong>
            </div>

            <div className="profile-page__field">
              <span className="profile-page__label">
                Date of birth
              </span>

              <strong className="profile-page__value">
                {client.individualProfile?.dateOfBirth
                  ? new Date(
                      client.individualProfile.dateOfBirth,
                    ).toLocaleDateString()
                  : 'Not provided'}
              </strong>
            </div>

            <div className="profile-page__field">
              <span className="profile-page__label">
                Account status
              </span>

              <strong
                className={
                  client.isActive
                    ? 'profile-page__status profile-page__status--active'
                    : 'profile-page__status profile-page__status--inactive'
                }
              >
                {client.isActive ? 'Active' : 'Inactive'}
              </strong>
            </div>

            <div className="profile-page__field profile-page__field--wide">
              <span className="profile-page__label">
                Address
              </span>

              <strong className="profile-page__value">
                {client.individualProfile?.address ||
                  'Not provided'}
              </strong>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}