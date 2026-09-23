import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import {
  CaseStatus
} from '../../features/cases/case.types'
import { useTaxCases } from '../../features/cases/useTaxCases'
import Pagination from '../../components/common/Pagination'

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

export default function StaffTaxCasesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const statusFilter = searchParams.get('status')

  const [pageNumber, setPageNumber] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPageNumber(1)
    }, 400)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [search])

  const {
    data,
    isLoading,
    isError,
    isFetching,
  } =   useTaxCases({
    pageNumber,
    pageSize: 20,
    search: debouncedSearch.trim() || undefined,
    status: statusFilter ?? undefined,
  })

  const taxCases = data?.items ?? []

  function changeFilter(value: string) {
    setPageNumber(1)

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

        <div className="staff-cases__controls">
          <label className="staff-cases__search">
            <span>Search</span>

            <input
              type="search"
              value={search}
              placeholder="Search client or description..."
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

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
        </div>
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
        taxCases.length === 0 && (
          <div className="staff-cases__empty">
            No tax cases found for this filter.
          </div>
        )}

      {!isLoading &&
        !isError &&
        taxCases.length > 0 && (
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
                {taxCases.map((taxCase) => (
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

            {data && (
              <Pagination
                pageNumber={data.pageNumber}
                totalPages={data.totalPages}
                onPageChange={setPageNumber}
              />
            )}
          </div>
        )}
    </div>
  )
}