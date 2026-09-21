import { Link, useSearchParams } from 'react-router-dom'

import {
  CaseStatus,
  type TaxCase,
} from '../../features/cases/case.types'
import { useTaxCases } from '../../features/cases/useTaxCases'

import './StaffTaxCasesPage.css'

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

function getStatusClassName(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Open:
      return 'staff-cases__status staff-cases__status--open'

    case CaseStatus.InProgress:
      return 'staff-cases__status staff-cases__status--progress'

    case CaseStatus.WaitingForClient:
      return 'staff-cases__status staff-cases__status--waiting'

    case CaseStatus.Completed:
      return 'staff-cases__status staff-cases__status--completed'

    case CaseStatus.Cancelled:
      return 'staff-cases__status staff-cases__status--cancelled'

    default:
      return 'staff-cases__status'
  }
}

function filterCases(
  cases: TaxCase[],
  filter: string | null
) {
  if (filter === 'open') {
    return cases.filter(
      (taxCase) =>
        taxCase.status === CaseStatus.Open ||
        taxCase.status === CaseStatus.InProgress
    )
  }

  if (filter === 'waitingForClient') {
    return cases.filter(
      (taxCase) =>
        taxCase.status === CaseStatus.WaitingForClient
    )
  }

  return cases
}

export default function StaffTaxCasesPage() {
  const { data: taxCases = [], isLoading, isError } =
    useTaxCases()

  const [searchParams, setSearchParams] =
    useSearchParams()

  const statusFilter = searchParams.get('status')

  const filteredCases = filterCases(
    taxCases,
    statusFilter
  )

  function changeFilter(value: string) {
    if (value === 'all') {
      setSearchParams({})
      return
    }

    setSearchParams({
      status: value,
    })
  }

  return (
    <div className="staff-cases">
      <header className="staff-cases__header">
        <div>
          <p className="section-eyebrow">
            TAX CASES
          </p>

          <h1 className="staff-cases__title">
            Tax Cases
          </h1>

          <p className="staff-cases__subtitle">
            Review and manage client tax cases.
          </p>
        </div>

        <label className="staff-cases__filter">
          <span>Status</span>

          <select
            value={statusFilter ?? 'all'}
            onChange={(event) =>
              changeFilter(event.target.value)
            }
          >
            <option value="all">All Cases</option>
            <option value="open">
              Open & In Progress
            </option>
            <option value="waitingForClient">
              Waiting for Client
            </option>
          </select>
        </label>
      </header>

      {isLoading && (
        <p className="staff-cases__message">
          Loading tax cases...
        </p>
      )}

      {isError && (
        <div className="staff-cases__error">
          Unable to load tax cases.
        </div>
      )}

      {!isLoading &&
        !isError &&
        filteredCases.length === 0 && (
          <div className="staff-cases__empty">
            No tax cases found for this filter.
          </div>
        )}

      {!isLoading &&
        !isError &&
        filteredCases.length > 0 && (
          <div className="staff-cases__table-wrapper">
            <table className="staff-cases__table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Tax Year</th>
                  <th>Status</th>
                  <th>Opened</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {filteredCases.map((taxCase) => (
                  <tr key={taxCase.id}>
                    <td>
                      <strong>
                        {taxCase.clientName}
                      </strong>
                    </td>

                    <td>{taxCase.taxYear}</td>

                    <td>
                      <span
                        className={getStatusClassName(
                          taxCase.status
                        )}
                      >
                        {getStatusLabel(
                          taxCase.status
                        )}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        taxCase.openedAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="staff-cases__actions">
                      <Link
                        to={`/staff/cases/${taxCase.id}`}
                        className="staff-cases__view"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}