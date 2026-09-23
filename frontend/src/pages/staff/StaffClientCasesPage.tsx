import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useClient } from '../../features/clients/useClient'
import { useClientTaxCases } from '../../features/cases/useClientTaxCases'
import { useCreateTaxCase } from '../../features/cases/useCreateTaxCase'
import { useEmployeeOptions } from '../../features/employees/useEmployeeOptions'

import './StaffClientCasesPage.css'

function getCaseStatusLabel(status: number) {
  switch (status) {
    case 1:
      return 'Draft'

    case 2:
      return 'Open'

    case 3:
      return 'In Progress'

    case 4:
      return 'Waiting for Client'

    case 5:
      return 'Completed'

    case 6:
      return 'Cancelled'

    default:
      return 'Unknown'
  }
}

export default function StaffClientCasesPage() {
  const { clientId } = useParams()

  const [taxYear, setTaxYear] = useState(
    new Date().getFullYear()
  )

  const [description, setDescription] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useClient(clientId)

  const {
    data: taxCases,
    isLoading: areCasesLoading,
    isError: areCasesError,
  } = useClientTaxCases(clientId)

  const {
    data: employees,
    isLoading: areEmployeesLoading,
    isError: areEmployeesError,
  } = useEmployeeOptions()

  const createTaxCase = useCreateTaxCase()

  async function handleCreateCase(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!clientId) {
      return
    }

    try {
      await createTaxCase.mutateAsync({
        clientId,
        employeeId: employeeId || null,
        taxYear,
        description: description.trim(),
      })

      setDescription('')
      setEmployeeId('')
    } catch {
      // Error state is displayed below.
    }
  }

  if (
    isClientLoading ||
    areCasesLoading ||
    areEmployeesLoading
  ) {
    return (
      <section className="staff-client-cases">
        <div className="staff-client-cases__state">
          Loading tax cases...
        </div>
      </section>
    )
  }

  if (
    isClientError ||
    areCasesError ||
    areEmployeesError ||
    !client
  ) {
    return (
      <section className="staff-client-cases">
        <div className="staff-client-cases__state staff-client-cases__state--error">
          We couldn't load this client's tax cases.
        </div>
      </section>
    )
  }

  return (
    <section className="staff-client-cases">
      <div className="staff-client-cases__header">
        <div>
          <span className="staff-client-cases__eyebrow">
            CLIENT TAX CASES
          </span>

          <h1>
            Tax Cases — {client.firstName} {client.lastName}
          </h1>

          <p>{client.email}</p>
        </div>

        <Link
          to="/staff/clients"
          className="staff-client-cases__back"
        >
          Back to Clients
        </Link>
      </div>

      <div className="staff-client-cases__create">
        <div className="staff-client-cases__create-header">
          <h2>Create Tax Case</h2>

          <p>
            Create a new tax case for this client.
          </p>
        </div>

        <form
          className="staff-client-cases__create-form"
          onSubmit={handleCreateCase}
        >
          <div className="staff-client-cases__field">
            <label htmlFor="tax-case-year">
              Tax Year
            </label>

            <input
              id="tax-case-year"
              type="number"
              min="2000"
              max="2100"
              value={taxYear}
              onChange={(event) =>
                setTaxYear(Number(event.target.value))
              }
              required
            />
          </div>

          <div className="staff-client-cases__field">
            <label htmlFor="tax-case-employee">
              Assigned Employee
            </label>

            <select
              id="tax-case-employee"
              value={employeeId}
              onChange={(event) =>
                setEmployeeId(event.target.value)
              }
              disabled={
                createTaxCase.isPending ||
                areEmployeesLoading ||
                areEmployeesError
              }
            >
              <option value="">
                Not assigned
              </option>

              {employees?.map((employee) => (
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

          <div className="staff-client-cases__field staff-client-cases__field--description">
            <label htmlFor="tax-case-description">
              Description
            </label>

            <input
              id="tax-case-description"
              type="text"
              value={description}
              placeholder="Example: 2025 Personal Tax Return"
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="staff-client-cases__create-button"
            disabled={createTaxCase.isPending}
          >
            {createTaxCase.isPending
              ? 'Creating...'
              : 'Create Tax Case'}
          </button>
        </form>

        {createTaxCase.isSuccess && (
          <div className="staff-client-cases__message staff-client-cases__message--success">
            Tax case created successfully.
          </div>
        )}

        {createTaxCase.isError && (
          <div className="staff-client-cases__message staff-client-cases__message--error">
            Unable to create the tax case.
          </div>
        )}
      </div>

      {!taxCases?.length ? (
        <div className="staff-client-cases__state">
          No tax cases found for this client.
        </div>
      ) : (
        <div className="staff-client-cases__table-wrapper">
          <table className="staff-client-cases__table">
            <thead>
              <tr>
                <th>Tax Year</th>
                <th>Status</th>
                <th>Assigned Employee</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {taxCases.map((taxCase) => {
                const assignedEmployee = employees?.find(
                  (employee) =>
                    employee.id === taxCase.employeeId
                )

                return (
                  <tr key={taxCase.id}>
                    <td>{taxCase.taxYear}</td>

                    <td>
                      {getCaseStatusLabel(taxCase.status)}
                    </td>

                    <td>
                      {assignedEmployee
                        ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`
                        : 'Not assigned'}
                    </td>

                    <td>
                      {taxCase.description || '—'}
                    </td>

                    <td>
                      <Link
                        to={`/staff/cases/${taxCase.id}`}
                        className="staff-client-cases__view-link"
                      >
                        View Case
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}