import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClients } from '../../features/clients/useClients'
import './ClientsPage.css'

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: clients,
    isLoading,
    isError,
  } = useClients()

  const filteredClients = useMemo(() => {
    if (!clients) {
      return []
    }

    const search = searchTerm.trim().toLowerCase()

    if (!search) {
      return clients
    }

    return clients.filter((client) => {
      const fullName =
        `${client.firstName} ${client.lastName}`.toLowerCase()

      return (
        fullName.includes(search) ||
        client.firstName.toLowerCase().includes(search) ||
        client.lastName.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        client.phoneNumber?.toLowerCase().includes(search)
      )
    })
  }, [clients, searchTerm])

  if (isLoading) {
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
          placeholder="Search by name, email or phone..."
          className="staff-clients-page__search-input"
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />
      </div>

      {!clients?.length ? (
        <div className="staff-clients-page__state">
          No clients found.
        </div>
      ) : !filteredClients.length ? (
        <div className="staff-clients-page__state">
          No clients match your search.
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
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>
                      {client.firstName} {client.lastName}
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
                      {client.isActive ? 'Active' : 'Inactive'}
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
    </section>
  )
}
