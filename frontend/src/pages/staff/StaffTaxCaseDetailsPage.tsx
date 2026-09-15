import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useClient } from '../../features/clients/useClient'
import { useTaxCase } from '../../features/cases/useTaxCase'
import { useUpdateTaxCase } from '../../features/cases/useUpdateTaxCase'
import { useEmployees } from '../../features/employees/useEmployees'

import { CaseStatus } from '../../features/cases/case.types'

import './StaffTaxCaseDetailsPage.css'

function getStatusLabel(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft:
      return 'Draft'

    case CaseStatus.Open:
      return 'Open'

    case CaseStatus.InProgress:
      return 'In Progress'

    case CaseStatus.WaitingForClient:
      return 'Waiting for Client'

    case CaseStatus.Completed:
      return 'Completed'

    case CaseStatus.Cancelled:
      return 'Cancelled'

    default:
      return 'Unknown'
  }
}

export default function StaffTaxCaseDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: taxCase,
    isLoading,
    isError,
  } = useTaxCase(id)

  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useClient(taxCase?.clientId)

  const {
    data: employees,
    isLoading: areEmployeesLoading,
    isError: areEmployeesError,
  } = useEmployees()

  const updateTaxCase = useUpdateTaxCase()

  const [taxYear, setTaxYear] = useState(
    new Date().getFullYear()
  )

  const [status, setStatus] = useState<CaseStatus>(
    CaseStatus.Open
  )

  const [description, setDescription] = useState('')

  const [employeeId, setEmployeeId] = useState('')

  useEffect(() => {
    if (taxCase) {
      setTaxYear(taxCase.taxYear)
      setStatus(taxCase.status)
      setDescription(taxCase.description)
      setEmployeeId(taxCase.employeeId ?? '')
    }
  }, [taxCase])

  function handleSaveChanges() {
    if (!taxCase || !id) {
      return
    }

    updateTaxCase.mutate({
      id,
      request: {
        employeeId: employeeId || null,
        taxYear,
        status,
        description: description.trim(),
      },
    })
  }

  if (isLoading) {
    return (
      <section className="staff-tax-case-details">
        <div className="staff-tax-case-details__container">
          <p className="staff-tax-case-details__state">
            Loading tax case...
          </p>
        </div>
      </section>
    )
  }

  if (isError || !taxCase) {
    return (
      <section className="staff-tax-case-details">
        <div className="staff-tax-case-details__container">
          <p className="staff-tax-case-details__state staff-tax-case-details__state--error">
            Tax case could not be loaded.
          </p>

          <Link
            to="/staff"
            className="staff-tax-case-details__back-link"
          >
            Back to Staff Panel
          </Link>
        </div>
      </section>
    )
  }

  const assignedEmployee = employees?.find(
    (employee) => employee.id === taxCase.employeeId
  )

  const activeEmployees = employees?.filter(
    (employee) =>
      employee.isActive ||
      employee.id === taxCase.employeeId
  )

  const hasChanges =
    taxYear !== taxCase.taxYear ||
    status !== taxCase.status ||
    description.trim() !== taxCase.description ||
    employeeId !== (taxCase.employeeId ?? '')

  return (
    <section className="staff-tax-case-details">
      <div className="staff-tax-case-details__container">

        <div className="staff-tax-case-details__header">
          <div>
            <span className="staff-tax-case-details__eyebrow">
              TAX CASE
            </span>

            <h1 className="staff-tax-case-details__title">
              Tax Case Details
            </h1>

            <p className="staff-tax-case-details__subtitle">
              Review and manage this client's tax case.
            </p>
          </div>

          <Link
            to={`/staff/clients/${taxCase.clientId}/cases`}
            className="staff-tax-case-details__back-link"
          >
            Back to Client Cases
          </Link>
        </div>

        <div className="staff-tax-case-details__card">
          <div className="staff-tax-case-details__grid">

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Tax Year
              </span>

              <span className="staff-tax-case-details__value">
                {taxCase.taxYear}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Current Status
              </span>

              <span className="staff-tax-case-details__value">
                {getStatusLabel(taxCase.status)}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Client
              </span>

              <span className="staff-tax-case-details__value">
                {isClientLoading
                  ? 'Loading...'
                  : client
                    ? `${client.firstName} ${client.lastName}`
                    : 'Unavailable'}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Email
              </span>

              <span className="staff-tax-case-details__value">
                {isClientLoading
                  ? 'Loading...'
                  : client?.email ?? 'Unavailable'}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Employee
              </span>

              <span className="staff-tax-case-details__value">
                {areEmployeesLoading
                  ? 'Loading...'
                  : assignedEmployee
                    ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`
                    : 'Not assigned'}
              </span>
            </div>

          </div>

          <div className="staff-tax-case-details__description">
            <span className="staff-tax-case-details__label">
              Description
            </span>

            <p className="staff-tax-case-details__description-text">
              {taxCase.description ||
                'No description provided.'}
            </p>
          </div>

          {isClientError && (
            <p className="staff-tax-case-details__error">
              Client information could not be loaded.
            </p>
          )}

          {areEmployeesError && (
            <p className="staff-tax-case-details__error">
              Employee information could not be loaded.
            </p>
          )}
        </div>

        <div className="staff-tax-case-details__card">

          <h2 className="staff-tax-case-details__section-title">
            Edit Tax Case
          </h2>

          <p className="staff-tax-case-details__section-description">
            Update the tax year, status, employee, or description.
          </p>

          <div className="staff-tax-case-details__field">
            <label
              htmlFor="taxYear"
              className="staff-tax-case-details__label"
            >
              Tax Year
            </label>

            <input
              id="taxYear"
              type="number"
              min="2000"
              max="2100"
              className="staff-tax-case-details__input"
              value={taxYear}
              onChange={(event) =>
                setTaxYear(Number(event.target.value))
              }
              disabled={updateTaxCase.isPending}
            />
          </div>

          <div className="staff-tax-case-details__field">
            <label
              htmlFor="status"
              className="staff-tax-case-details__label"
            >
              Case Status
            </label>

            <select
              id="status"
              className="staff-tax-case-details__select"
              value={status}
              onChange={(event) =>
                setStatus(
                  Number(event.target.value) as CaseStatus
                )
              }
              disabled={updateTaxCase.isPending}
            >
              <option value={CaseStatus.Draft}>
                Draft
              </option>

              <option value={CaseStatus.Open}>
                Open
              </option>

              <option value={CaseStatus.InProgress}>
                In Progress
              </option>

              <option value={CaseStatus.WaitingForClient}>
                Waiting for Client
              </option>

              <option value={CaseStatus.Completed}>
                Completed
              </option>

              <option value={CaseStatus.Cancelled}>
                Cancelled
              </option>
            </select>
          </div>

          <div className="staff-tax-case-details__field">
            <label
              htmlFor="employee"
              className="staff-tax-case-details__label"
            >
              Assigned Employee
            </label>

            <select
              id="employee"
              className="staff-tax-case-details__select"
              value={employeeId}
              onChange={(event) =>
                setEmployeeId(event.target.value)
              }
              disabled={
                updateTaxCase.isPending ||
                areEmployeesLoading ||
                areEmployeesError
              }
            >
              <option value="">
                Not assigned
              </option>

              {activeEmployees?.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.firstName} {employee.lastName}
                  {employee.jobTitle
                    ? ` — ${employee.jobTitle}`
                    : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-tax-case-details__field">
            <label
              htmlFor="description"
              className="staff-tax-case-details__label"
            >
              Description
            </label>

            <textarea
              id="description"
              className="staff-tax-case-details__textarea"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={2000}
              rows={5}
              disabled={updateTaxCase.isPending}
            />
          </div>

          <div className="staff-tax-case-details__actions">
            <button
              type="button"
              className="staff-tax-case-details__save-button"
              onClick={handleSaveChanges}
              disabled={
                updateTaxCase.isPending ||
                !hasChanges ||
                taxYear < 2000 ||
                taxYear > 2100
              }
            >
              {updateTaxCase.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>

          {updateTaxCase.isSuccess && (
            <p className="staff-tax-case-details__success">
              Tax case updated successfully.
            </p>
          )}

          {updateTaxCase.isError && (
            <p className="staff-tax-case-details__error">
              Failed to update tax case.
            </p>
          )}

        </div>

      </div>
    </section>
  )
}
