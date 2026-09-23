import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'

import ConfirmModal from '../../components/common/ConfirmModal'

import { useEmployees } from '../../features/employees/useEmployees'
import { useCreateEmployee } from '../../features/employees/useCreateEmployee'
import { useUpdateEmployee } from '../../features/employees/useUpdateEmployee'
import { useChangeEmployeeStatus } from '../../features/employees/useChangeEmployeeStatus'
import { useResendEmployeeInvitation } from '../../features/employees/useResendEmployeeInvitation'

import type { Employee } from '../../features/employees/employee.types'

import './EmployeesPage.css'

export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const statusFilter = searchParams.get('status')

  const [searchTerm, setSearchTerm] = useState('')

  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1)
    }, 400)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchTerm])

  const [isCreateFormOpen, setIsCreateFormOpen] =
    useState(false)

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null)

  const [resendingEmployeeId, setResendingEmployeeId] =
    useState<string | null>(null)

  const [invitationEmployee, setInvitationEmployee] =
    useState<Employee | null>(null)

  const [statusEmployee, setStatusEmployee] =
    useState<Employee | null>(null)

  const [statusMessage, setStatusMessage] =
    useState('')

  const [statusError, setStatusError] =
    useState('')

  const [invitationMessage, setInvitationMessage] =
    useState('')

  const [invitationError, setInvitationError] =
    useState('')

const {
  data,
  isLoading,
  isError,
} = useEmployees({
  pageNumber,
  pageSize: 20,
  search: debouncedSearch || undefined,
  isActive:
    statusFilter === 'active'
      ? true
      : statusFilter === 'inactive'
        ? false
        : undefined,
})

const employees = data?.items ?? []

  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const changeEmployeeStatus = useChangeEmployeeStatus()
  const resendInvitation = useResendEmployeeInvitation()

  const isFormOpen =
    isCreateFormOpen || editingEmployee !== null

  const isSubmitting =
    createEmployee.isPending ||
    updateEmployee.isPending

    function handleStatusFilterChange(value: string) {
      setPageNumber(1)

      if (value === 'all') {
        setSearchParams({})
        return
      }

      setSearchParams({
        status: value,
      })
    }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const request = {
      firstName: String(
        formData.get('firstName') ?? ''
      ).trim(),

      lastName: String(
        formData.get('lastName') ?? ''
      ).trim(),

      email: String(
        formData.get('email') ?? ''
      ).trim(),

      phoneNumber: String(
        formData.get('phoneNumber') ?? ''
      ).trim(),

      jobTitle: String(
        formData.get('jobTitle') ?? ''
      ).trim(),
    }

    try {
      if (editingEmployee) {
        await updateEmployee.mutateAsync({
          employeeId: editingEmployee.id,
          request,
        })
      } else {
        await createEmployee.mutateAsync(request)
      }

      form.reset()
      closeForm()
    } catch {
      // Error is displayed below the form.
    }
  }

  function openCreateForm() {
    createEmployee.reset()
    updateEmployee.reset()

    setEditingEmployee(null)
    setIsCreateFormOpen(true)
  }

  function openEditForm(employee: Employee) {
    createEmployee.reset()
    updateEmployee.reset()

    setIsCreateFormOpen(false)
    setEditingEmployee(employee)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function closeForm() {
    createEmployee.reset()
    updateEmployee.reset()

    setIsCreateFormOpen(false)
    setEditingEmployee(null)
  }

  function handleChangeStatus(employee: Employee) {
    setStatusMessage('')
    setStatusError('')
    setStatusEmployee(employee)
  }

  async function confirmChangeStatus() {
    if (!statusEmployee) {
      return
    }

    const employee = statusEmployee

    const action = employee.isActive
      ? 'deactivate'
      : 'activate'

    setStatusMessage('')
    setStatusError('')

    try {
      await changeEmployeeStatus.mutateAsync({
        employeeId: employee.id,
        isActive: employee.isActive,
      })

      setStatusEmployee(null)

      setStatusMessage(
        `${employee.firstName} ${employee.lastName} was ${
          employee.isActive
            ? 'deactivated'
            : 'activated'
        } successfully.`
      )
    } catch (err: any) {
      setStatusEmployee(null)

      setStatusError(
        err?.response?.data?.detail ??
          `We couldn't ${action} this employee. Please try again.`
      )
    }
  }

  function cancelChangeStatus() {
    if (changeEmployeeStatus.isPending) {
      return
    }

    setStatusEmployee(null)
  }

  function handleResendInvitation(
    employee: Employee
  ) {
    setInvitationMessage('')
    setInvitationError('')
    setInvitationEmployee(employee)
  }

  async function confirmResendInvitation() {
    if (!invitationEmployee) {
      return
    }

    const employee = invitationEmployee

    setResendingEmployeeId(employee.id)
    setInvitationMessage('')
    setInvitationError('')

    try {
      await resendInvitation.mutateAsync(employee.id)

      setInvitationEmployee(null)

      setInvitationMessage(
        `Invitation sent successfully to ${employee.email}.`
      )
    } catch (err: any) {
      setInvitationEmployee(null)

      setInvitationError(
        err?.response?.data?.detail ??
          "We couldn't send the invitation. Please try again."
      )
    } finally {
      setResendingEmployeeId(null)
    }
  }

  function cancelResendInvitation() {
    if (resendInvitation.isPending) {
      return
    }

    setInvitationEmployee(null)
  }

  if (isLoading && !data) {
    return (
      <section className="staff-employees-page">
        <div className="staff-employees-page__state">
          Loading employees...
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="staff-employees-page">
        <div className="staff-employees-page__state staff-employees-page__state--error">
          We couldn't load the employees.
        </div>
      </section>
    )
  }

  return (
    <section className="staff-employees-page">
      <div className="staff-employees-page__header">
        <div>
          <span className="staff-employees-page__eyebrow">
            EMPLOYEE MANAGEMENT
          </span>

          <h1>Employees</h1>

          <p>
            View and manage staff members.
          </p>
        </div>

        <button
          type="button"
          className="staff-employees-page__add-button"
          onClick={openCreateForm}
          disabled={isFormOpen}
        >
          Add Employee
        </button>
      </div>

      {isFormOpen && (
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
              onClick={closeForm}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>

          <form
            key={editingEmployee?.id ?? 'create'}
            className="staff-employees-page__form"
            onSubmit={handleSubmit}
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

            {(createEmployee.isError ||
              updateEmployee.isError) && (
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
      )}

      {invitationMessage && (
        <div className="staff-employees-page__message staff-employees-page__message--success">
          {invitationMessage}
        </div>
      )}

      {invitationError && (
        <div className="staff-employees-page__message staff-employees-page__message--error">
          {invitationError}
        </div>
      )}

      {statusMessage && (
        <div className="staff-employees-page__message staff-employees-page__message--success">
          {statusMessage}
        </div>
      )}

      {statusError && (
        <div className="staff-employees-page__message staff-employees-page__message--error">
          {statusError}
        </div>
      )}

      <div className="staff-employees-page__filters">
        <div className="staff-employees-page__search">
          <label
            htmlFor="employee-search"
            className="staff-employees-page__search-label"
          >
            Search Employees
          </label>

          <input
            id="employee-search"
            type="search"
            value={searchTerm}
            placeholder="Search by name, email or job title..."
            className="staff-employees-page__search-input"
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="staff-employees-page__filter">
          <label
            htmlFor="employee-status-filter"
            className="staff-employees-page__search-label"
          >
            Status
          </label>

          <select
            id="employee-status-filter"
            className="staff-employees-page__filter-select"
            value={statusFilter ?? 'all'}
            onChange={(event) =>
              handleStatusFilterChange(
                event.target.value
              )
            }
          >
            <option value="all">
              All Employees
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>

     {!employees.length ? (
      <div className="staff-employees-page__state">
        {debouncedSearch || statusFilter
          ? 'No employees match the selected filters.'
          : 'No employees found.'}
      </div>
    ) : (    
        <div className="staff-employees-page__table-wrapper">
          <table className="staff-employees-page__table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <strong>
                      {employee.firstName}{' '}
                      {employee.lastName}
                    </strong>
                  </td>

                  <td>{employee.email}</td>

                  <td>
                    {employee.phoneNumber || '—'}
                  </td>

                  <td>
                    {employee.jobTitle || '—'}
                  </td>

                  <td>
                    <span
                      className={
                        employee.isActive
                          ? 'staff-employees-page__status staff-employees-page__status--active'
                          : 'staff-employees-page__status staff-employees-page__status--inactive'
                      }
                    >
                      {employee.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="staff-employees-page__actions">
                      <button
                        type="button"
                        className="staff-employees-page__edit-button"
                        onClick={() =>
                          openEditForm(employee)
                        }
                        disabled={
                          changeEmployeeStatus.isPending ||
                          resendInvitation.isPending
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="staff-employees-page__invitation-button"
                        onClick={() =>
                          handleResendInvitation(
                            employee
                          )
                        }
                        disabled={
                          resendInvitation.isPending
                        }
                      >
                        {resendingEmployeeId ===
                        employee.id
                          ? 'Sending...'
                          : 'Resend Invitation'}
                      </button>

                      <button
                        type="button"
                        className={
                          employee.isActive
                            ? 'staff-employees-page__status-button staff-employees-page__status-button--deactivate'
                            : 'staff-employees-page__status-button staff-employees-page__status-button--activate'
                        }
                        onClick={() =>
                          handleChangeStatus(employee)
                        }
                        disabled={
                          changeEmployeeStatus.isPending ||
                          resendInvitation.isPending
                        }
                      >
                        {employee.isActive
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <Pagination
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={setPageNumber}
        />
      )}

      <ConfirmModal
        isOpen={invitationEmployee !== null}
        title="Resend Invitation"
        message={
          invitationEmployee
            ? `Send a new password setup invitation to ${invitationEmployee.email}?`
            : ''
        }
        confirmText="Send Invitation"
        isPending={resendInvitation.isPending}
        onConfirm={confirmResendInvitation}
        onCancel={cancelResendInvitation}
      />

      <ConfirmModal
        isOpen={statusEmployee !== null}
        title={
          statusEmployee?.isActive
            ? 'Deactivate Employee'
            : 'Activate Employee'
        }
        message={
          statusEmployee
            ? `Are you sure you want to ${
                statusEmployee.isActive
                  ? 'deactivate'
                  : 'activate'
              } ${statusEmployee.firstName} ${statusEmployee.lastName}?`
            : ''
        }
        confirmText={
          statusEmployee?.isActive
            ? 'Deactivate'
            : 'Activate'
        }
        isPending={
          changeEmployeeStatus.isPending
        }
        onConfirm={confirmChangeStatus}
        onCancel={cancelChangeStatus}
      />
    </section>
  )
}