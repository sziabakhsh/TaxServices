import type { FormEvent } from 'react'
import type { Employee } from '../../../features/employees/employee.types'

type Props = {
  editingEmployee: Employee | null
  isSubmitting: boolean
  hasError: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export default function EmployeeForm({ editingEmployee, isSubmitting, hasError, onSubmit, onClose }: Props) {
  return (
        <div className="staff-employees-page__form-card">
          <div className="staff-employees-page__form-header">
            <div>
              <h2>
                {editingEmployee
                  ? 'Edit Employee'
                  : 'Add Employee'}
              </h2>

              <p>
                {editingEmployee
                  ? 'Update the employee information.'
                  : "Enter the new employee's information."}
              </p>
            </div>

            <button
              type="button"
              className="staff-employees-page__cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

          <form
            key={editingEmployee?.id ?? 'create'}
            className="staff-employees-page__form"
            onSubmit={onSubmit}
          >
            <div className="staff-employees-page__form-grid">
              <div className="staff-employees-page__field">
                <label htmlFor="employee-first-name">
                  First Name
                </label>

                <input
                  id="employee-first-name"
                  name="firstName"
                  type="text"
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                  defaultValue={
                    editingEmployee?.firstName ?? ''
                  }
                />
              </div>

              <div className="staff-employees-page__field">
                <label htmlFor="employee-last-name">
                  Last Name
                </label>

                <input
                  id="employee-last-name"
                  name="lastName"
                  type="text"
                  maxLength={100}
                  required
                  disabled={isSubmitting}
                  defaultValue={
                    editingEmployee?.lastName ?? ''
                  }
                />
              </div>

              <div className="staff-employees-page__field">
                <label htmlFor="employee-email">
                  Email
                </label>

                <input
                  id="employee-email"
                  name="email"
                  type="email"
                  maxLength={255}
                  required
                  disabled={isSubmitting}
                  defaultValue={
                    editingEmployee?.email ?? ''
                  }
                />
              </div>

              <div className="staff-employees-page__field">
                <label htmlFor="employee-phone">
                  Phone
                </label>

                <input
                  id="employee-phone"
                  name="phoneNumber"
                  type="tel"
                  maxLength={30}
                  disabled={isSubmitting}
                  defaultValue={
                    editingEmployee?.phoneNumber ?? ''
                  }
                />
              </div>

              <div className="staff-employees-page__field">
                <label htmlFor="employee-job-title">
                  Job Title
                </label>

                <input
                  id="employee-job-title"
                  name="jobTitle"
                  type="text"
                  maxLength={100}
                  disabled={isSubmitting}
                  defaultValue={
                    editingEmployee?.jobTitle ?? ''
                  }
                />
              </div>
            </div>

            {(hasError) && (
              <div className="staff-employees-page__form-error">
                {editingEmployee
                  ? "We couldn't update the employee. Please check the information and try again."
                  : "We couldn't create the employee. Please check the information and try again."}
              </div>
            )}

            <div className="staff-employees-page__form-actions">
              <button
                type="submit"
                className="staff-employees-page__submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingEmployee
                    ? 'Save Changes'
                    : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
  )
}
