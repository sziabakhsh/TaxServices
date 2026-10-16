import { CaseStatus, type TaxCase } from '../../../features/cases/case.types'
import type { StaffClient } from '../../../features/clients/client.types'
import type { Employee } from '../../../features/employees/employee.types'

interface Props {
  taxCase: TaxCase
  client?: StaffClient
  assignedEmployee?: Employee
  isClientLoading: boolean
  isClientError: boolean
  areEmployeesLoading: boolean
  areEmployeesError: boolean
  areServicesError: boolean
}

function getStatusLabel(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft: return 'Draft'
    case CaseStatus.Open: return 'Open'
    case CaseStatus.InProgress: return 'In Progress'
    case CaseStatus.WaitingForClient: return 'Waiting for Client'
    case CaseStatus.Completed: return 'Completed'
    case CaseStatus.Cancelled: return 'Cancelled'
    default: return 'Unknown'
  }
}

export default function TaxCaseInformation({
  taxCase, client, assignedEmployee, isClientLoading,
  isClientError, areEmployeesLoading, areEmployeesError,
  areServicesError,
}: Props) {
  return (
        <div className="staff-tax-case-details__card">
          <div className="staff-tax-case-details__grid">
            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Service
              </span>

              <span className="staff-tax-case-details__value">
                {taxCase.serviceName}
              </span>
            </div>

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

          {areServicesError && (
            <p className="staff-tax-case-details__error">
              Service information could not be loaded.
            </p>
          )}
        </div>
  )
}
