import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'

import { useAuth } from '../../features/auth/useAuth'

import { useEmployees } from '../../features/employees/useEmployees'
import { useCreateEmployee } from '../../features/employees/useCreateEmployee'
import { useUpdateEmployee } from '../../features/employees/useUpdateEmployee'
import { useChangeEmployeeStatus } from '../../features/employees/useChangeEmployeeStatus'
import { useResendEmployeeInvitation } from '../../features/employees/useResendEmployeeInvitation'

import type { Employee } from '../../features/employees/employee.types'

import EmployeeForm from './components/EmployeeForm'
import EmployeeFilters from './components/EmployeeFilters'
import EmployeesTable from './components/EmployeesTable'

import './EmployeesPage.css'

export default function EmployeesPage() {
  const { user } = useAuth()

  const isAdmin =
    user?.roles.includes('Admin') ?? false

  const [searchParams, setSearchParams] =
    useSearchParams()

  const statusFilter = searchParams.get('status')

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] =
    useState('')
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
  const changeEmployeeStatus =
    useChangeEmployeeStatus()
  const resendInvitation =
    useResendEmployeeInvitation()

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

    // Frontend protection.
    // Backend authorization remains the real
    // security boundary.
    if (!isAdmin) {
      return
    }

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
    if (!isAdmin) {
      return
    }

    createEmployee.reset()
    updateEmployee.reset()

    setEditingEmployee(null)
    setIsCreateFormOpen(true)
  }

  function openEditForm(employee: Employee) {
    if (!isAdmin) {
      return
    }

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
    if (!isAdmin) {
      return
    }

    setStatusMessage('')
    setStatusError('')
    setStatusEmployee(employee)
  }

  async function confirmChangeStatus() {
    if (!isAdmin || !statusEmployee) {
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
    if (!isAdmin) {
      return
    }

    setInvitationMessage('')
    setInvitationError('')
    setInvitationEmployee(employee)
  }

  async function confirmResendInvitation() {
    if (!isAdmin || !invitationEmployee) {
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
            {isAdmin
              ? 'View and manage staff members.'
              : 'View staff members.'}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            className="staff-employees-page__add-button"
            onClick={openCreateForm}
            disabled={isFormOpen}
          >
            Add Employee
          </button>
        )}
      </div>

      {isAdmin && isFormOpen && (
        <EmployeeForm
          editingEmployee={editingEmployee}
          isSubmitting={isSubmitting}
          hasError={createEmployee.isError || updateEmployee.isError}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
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

      <EmployeeFilters searchTerm={searchTerm} statusFilter={statusFilter} onSearchChange={setSearchTerm} onStatusChange={handleStatusFilterChange} />

      {!employees.length ? (
        <div className="staff-employees-page__state">
          {debouncedSearch || statusFilter
            ? 'No employees match the selected filters.'
            : 'No employees found.'}
        </div>
      ) : (
        <EmployeesTable employees={employees} isAdmin={isAdmin} isChangingStatus={changeEmployeeStatus.isPending} isResendingInvitation={resendInvitation.isPending} resendingEmployeeId={resendingEmployeeId} onEdit={openEditForm} onResendInvitation={handleResendInvitation} onChangeStatus={handleChangeStatus} />
      )}

      {data && (
        <Pagination
          pageNumber={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={setPageNumber}
        />
      )}

      {isAdmin && (
        <>
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
        </>
      )}
    </section>
  )
}