import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'

import { useClients } from '../../features/clients/useClients'

import './ClientsPage.css'

export default function ClientsPage() {
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

  const {
    data,
    isLoading,
    isError,
  } = useClients({
    pageNumber,
    pageSize: 20,
    search: debouncedSearch || undefined,
  })

  if (isLoading && !data) {
    return (
      <section className="staff-clients-page">
        <div className="staff-clients-page__state">
          Loading clients...
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="staff-clients-page">
        <div className="staff-clients-page__state staff-clients-page__state--error">
          We couldn't load the clients.
        </div>
      </section>
    )
  }

  const clients = data?.items ?? []

  return (
    <section className="staff-clients-page">
      <div className="staff-clients-page__header">
        <div>
          <span className="staff-clients-page__eyebrow">
            CLIENT MANAGEMENT
          </span>

          <h1>Clients</h1>

          <p>
            View clients and manage their tax documents.
          </p>
        </div>
      </div>

      <div className="staff-clients-page__search">
        <label
          htmlFor="client-search"
          className="staff-clients-page__search-label"
        >
          Search Clients
        </label>

        <input
          id="client-search"
          type="search"
          value={searchTerm}
          placeholder="Search by name or email..."
          className="staff-clients-page__search-input"
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />
      </div>

      <div className="staff-clients-page__summary">
        {data?.totalCount ?? 0} clients
      </div>

      {!clients.length ? (
        <div className="staff-clients-page__state">
          {debouncedSearch
            ? 'No clients match your search.'
            : 'No clients found.'}
        </div>
      ) : (
        <div className="staff-clients-page__table-wrapper">
          <table className="staff-clients-page__table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>
                      {client.firstName}{' '}
                      {client.lastName}
                    </strong>
                  </td>

                  <td>{client.email}</td>

                  <td>
                    {client.phoneNumber || '—'}
                  </td>

                  <td>
                    <span
                      className={
                        client.isActive
                          ? 'staff-clients-page__status staff-clients-page__status--active'
                          : 'staff-clients-page__status staff-clients-page__status--inactive'
                      }
                    >
                      {client.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="staff-clients-page__actions">
                      <Link
                        to={`/staff/clients/${client.id}/cases`}
                        className="staff-clients-page__action"
                      >
                        View Tax Cases
                      </Link>

                      <Link
                        to={`/staff/clients/${client.id}/documents`}
                        className="staff-clients-page__action"
                      >
                        View Documents
                      </Link>
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

    </section>
  )
}