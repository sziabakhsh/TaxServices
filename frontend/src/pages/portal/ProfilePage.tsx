import { useMyClientProfile } from '../../features/clients/useMyClientProfile'
import './ProfilePage.css'

export default function ProfilePage() {
  const {
    data: client,
    isLoading,
    isError,
  } = useMyClientProfile()

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
        <span className="profile-page__eyebrow">
          MY ACCOUNT
        </span>

        <h1 className="profile-page__title">
          Profile
        </h1>

        <p className="profile-page__description">
          Review your personal and account information.
        </p>

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
        </div>
      </div>
    </section>
  )
}