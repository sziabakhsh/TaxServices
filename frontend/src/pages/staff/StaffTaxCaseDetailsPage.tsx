import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useTaxCase } from '../../features/cases/useTaxCase'
import { useUpdateTaxCase } from '../../features/cases/useUpdateTaxCase'

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

  const updateTaxCase = useUpdateTaxCase()

  const [status, setStatus] = useState<CaseStatus>(CaseStatus.Open)

  useEffect(() => {
    if (taxCase) {
      setStatus(taxCase.status)
    }
  }, [taxCase])

  function handleSaveStatus() {
    if (!taxCase || !id) {
      return
    }

    updateTaxCase.mutate({
      id,
      request: {
        employeeId: taxCase.employeeId ?? null,
        taxYear: taxCase.taxYear,
        status,
        description: taxCase.description,
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

  const statusChanged = status !== taxCase.status

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
            to="/staff"
            className="staff-tax-case-details__back-link"
          >
            Back to Staff Panel
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
                Client ID
              </span>

              <span className="staff-tax-case-details__value">
                {taxCase.clientId}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Employee ID
              </span>

              <span className="staff-tax-case-details__value">
                {taxCase.employeeId ?? 'Not assigned'}
              </span>
            </div>

          </div>

          <div className="staff-tax-case-details__description">
            <span className="staff-tax-case-details__label">
              Description
            </span>

            <p className="staff-tax-case-details__description-text">
              {taxCase.description}
            </p>
          </div>

        </div>

        <div className="staff-tax-case-details__card">

          <h2 className="staff-tax-case-details__section-title">
            Update Case Status
          </h2>

          <p className="staff-tax-case-details__section-description">
            Change the current status of this tax case.
          </p>

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

          <div className="staff-tax-case-details__actions">

            <button
              type="button"
              className="staff-tax-case-details__save-button"
              onClick={handleSaveStatus}
              disabled={
                updateTaxCase.isPending ||
                !statusChanged
              }
            >
              {updateTaxCase.isPending
                ? 'Saving...'
                : 'Save Status'}
            </button>

          </div>

          {updateTaxCase.isSuccess && (
            <p className="staff-tax-case-details__success">
              Status updated successfully.
            </p>
          )}

          {updateTaxCase.isError && (
            <p className="staff-tax-case-details__error">
              Failed to update status.
            </p>
          )}

        </div>

      </div>
    </section>
  )
}