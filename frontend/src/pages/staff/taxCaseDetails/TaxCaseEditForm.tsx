import type { Dispatch, SetStateAction } from 'react'
import { CaseStatus } from '../../../features/cases/case.types'
import type { Employee } from '../../../features/employees/employee.types'
import type { Service } from '../../../features/services/service.types'

type TaxCaseEditFormProps = {
  serviceId: string
  setServiceId: Dispatch<SetStateAction<string>>
  taxYear: number
  setTaxYear: Dispatch<SetStateAction<number>>
  status: CaseStatus
  setStatus: Dispatch<SetStateAction<CaseStatus>>
  employeeId: string
  setEmployeeId: Dispatch<SetStateAction<string>>
  description: string
  setDescription: Dispatch<SetStateAction<string>>
  availableServices: Service[] | undefined
  activeEmployees: Employee[] | undefined
  areServicesLoading: boolean
  areServicesError: boolean
  areEmployeesLoading: boolean
  areEmployeesError: boolean
  isSaving: boolean
  hasChanges: boolean
  isSuccess: boolean
  isError: boolean
  onSave: () => void
}

export default function TaxCaseEditForm({
  serviceId, setServiceId, taxYear, setTaxYear,
  status, setStatus, employeeId, setEmployeeId,
  description, setDescription, availableServices,
  activeEmployees, areServicesLoading, areServicesError,
  areEmployeesLoading, areEmployeesError,
  isSaving, hasChanges, isSuccess, isError, onSave,
}: TaxCaseEditFormProps) {
  return (
        <div className="staff-tax-case-details__card">
          <h2 className="staff-tax-case-details__section-title">
            Edit Tax Case
          </h2>

          <p className="staff-tax-case-details__section-description">
            Update the service, tax year, status, employee, or
            description.
          </p>

          <div className="staff-tax-case-details__edit-grid">
            <div className="staff-tax-case-details__field">
              <label
                htmlFor="service"
                className="staff-tax-case-details__label"
              >
                Service
              </label>

              <select
                id="service"
                className="staff-tax-case-details__select"
                value={serviceId}
                onChange={(event) =>
                  setServiceId(event.target.value)
                }
                disabled={
                  isSaving ||
                  areServicesLoading ||
                  areServicesError
                }
              >
                {availableServices?.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name}
                    {!service.isActive
                      ? ' — Inactive'
                      : ''}
                  </option>
                ))}
              </select>
            </div>

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
                disabled={isSaving}
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
                disabled={isSaving}
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
                  isSaving ||
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
                    {employee.firstName}{' '}
                    {employee.lastName}
                    {employee.jobTitle
                      ? ` — ${employee.jobTitle}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="staff-tax-case-details__field staff-tax-case-details__field--description">
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
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="staff-tax-case-details__actions">
            <button
              type="button"
              className="staff-tax-case-details__save-button"
              onClick={onSave}
              disabled={
                isSaving ||
                !hasChanges ||
                !serviceId ||
                taxYear < 2000 ||
                taxYear > 2100
              }
            >
              {isSaving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>

          {isSuccess && (
            <p className="staff-tax-case-details__success">
              Tax case updated successfully.
            </p>
          )}

          {isError && (
            <p className="staff-tax-case-details__error">
              Failed to update tax case.
            </p>
          )}
        </div>

  )
}
