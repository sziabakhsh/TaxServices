import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { useEmployees } from '../../features/employees/useEmployees'
import { useCreateEmployee } from '../../features/employees/useCreateEmployee'
import { useUpdateEmployee } from '../../features/employees/useUpdateEmployee'

import type { Employee } from '../../features/employees/employee.types'
import { useChangeEmployeeStatus } from '../../features/employees/useChangeEmployeeStatus'

import './EmployeesPage.css'

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null)

  const {
    data: employees,
    isLoading,
    isError,
  } = useEmployees()

  const createEmployee = useCreateEmployee()
  const updateEmployee = useUpdateEmployee()
  const changeEmployeeStatus = useChangeEmployeeStatus()

  const isFormOpen =
    isCreateFormOpen || editingEmployee !== null

  const isSubmitting =
    createEmployee.isPending || updateEmployee.isPending

  const filteredEmployees = useMemo(() => {
    if (!employees) {
      return []
    }

    const search = searchTerm.trim().toLowerCase()

    if (!search) {
      return employees
    }

    return employees.filter((employee) => {
      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase()

      return (
        fullName.includes(search) ||
        employee.firstName.toLowerCase().includes(search) ||
        employee.lastName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.phoneNumber?.toLowerCase().includes(search) ||
        employee.jobTitle.toLowerCase().includes(search)
      )
    })
  }, [employees, searchTerm])

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


  async function handleChangeStatus(employee: Employee) {
    const action = employee.isActive
      ? 'deactivate'
      : 'activate'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${employee.firstName} ${employee.lastName}?`
    )

    if (!confirmed) {
      return
    }

    try {
      await changeEmployeeStatus.mutateAsync({
        employeeId: employee.id,
        isActive: employee.isActive,
      })
    } catch {
      window.alert(
        `We couldn't ${action} this employee. Please try again.`
      )
    }
  }

  if (isLoading) {
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
          placeholder="Search by name, email, phone or job title..."
          className="staff-employees-page__search-input"
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />
      </div>

      {!employees?.length ? (
        <div className="staff-employees-page__state">
          No employees found.
        </div>
      ) : !filteredEmployees.length ? (
        <div className="staff-employees-page__state">
          No employees match your search.
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
              {filteredEmployees.map((employee) => (
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
                        onClick={() => openEditForm(employee)}
                        disabled={changeEmployeeStatus.isPending}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className={
                          employee.isActive
                            ? 'staff-employees-page__status-button staff-employees-page__status-button--deactivate'
                            : 'staff-employees-page__status-button staff-employees-page__status-button--activate'
                        }
                        onClick={() => handleChangeStatus(employee)}
                        disabled={changeEmployeeStatus.isPending}
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
    </section>
  )
}
