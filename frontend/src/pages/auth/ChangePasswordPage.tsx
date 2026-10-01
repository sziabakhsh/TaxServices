import { FormEvent, useState } from 'react'
import axios from 'axios'
import { useChangePassword } from '../../features/auth/useChangePassword'
import './ChangePasswordPage.css'

export default function ChangePasswordPage() {
  const changePasswordMutation = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setValidationError('')
    setSuccessMessage('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('Please complete all password fields.')
      return
    }

    if (newPassword.length < 6) {
      setValidationError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setValidationError('New password and confirmation do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setValidationError(
        'New password must be different from your current password.',
      )
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccessMessage('Your password has been changed successfully.')
    } catch {
      // Error is rendered from mutation state below.
    }
  }

  const getServerError = () => {
    if (!changePasswordMutation.error) {
      return ''
    }

    if (axios.isAxiosError(changePasswordMutation.error)) {
      return (
        changePasswordMutation.error.response?.data?.detail ??
        'We could not change your password. Please try again.'
      )
    }

    return 'We could not change your password. Please try again.'
  }

  const serverError = getServerError()

  return (
    <section className="change-password-page">
      <div className="change-password-page__container">
        <span className="change-password-page__eyebrow">
          SECURITY
        </span>

        <h1 className="change-password-page__title">
          Change Password
        </h1>

        <p className="change-password-page__description">
          Update the password you use to access your account.
        </p>

        <form
          className="change-password-form"
          onSubmit={handleSubmit}
        >
          <div className="change-password-form__field">
            <label
              className="change-password-form__label"
              htmlFor="current-password"
            >
              Current Password
            </label>

            <input
              id="current-password"
              className="change-password-form__input"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              disabled={changePasswordMutation.isPending}
            />
          </div>

          <div className="change-password-form__field">
            <label
              className="change-password-form__label"
              htmlFor="new-password"
            >
              New Password
            </label>

            <input
              id="new-password"
              className="change-password-form__input"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              disabled={changePasswordMutation.isPending}
            />
          </div>

          <div className="change-password-form__field">
            <label
              className="change-password-form__label"
              htmlFor="confirm-password"
            >
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              className="change-password-form__input"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={changePasswordMutation.isPending}
            />
          </div>

          {validationError && (
            <div className="change-password-form__message change-password-form__message--error">
              {validationError}
            </div>
          )}

          {serverError && (
            <div className="change-password-form__message change-password-form__message--error">
              {serverError}
            </div>
          )}

          {successMessage && (
            <div className="change-password-form__message change-password-form__message--success">
              {successMessage}
            </div>
          )}

          <button
            className="change-password-form__submit"
            type="submit"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? 'Changing Password...'
              : 'Change Password'}
          </button>
        </form>
      </div>
    </section>
  )
}
