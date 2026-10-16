import type { Employee } from '../../../features/employees/employee.types'

type Props = {
  employees: Employee[]
  isAdmin: boolean
  isChangingStatus: boolean
  isResendingInvitation: boolean
  resendingEmployeeId: string | null
  onEdit: (employee: Employee) => void
  onResendInvitation: (employee: Employee) => void
  onChangeStatus: (employee: Employee) => void
}

export default function EmployeesTable({ employees, isAdmin, isChangingStatus, isResendingInvitation, resendingEmployeeId, onEdit, onResendInvitation, onChangeStatus }: Props) {
  return (
        <div className="staff-employees-page__table-wrapper">
          <table className="staff-employees-page__table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Job Title</th>
                <th>Status</th>

                {isAdmin && (
                  <th>Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
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

                  {isAdmin && (
                    <td>
                      <div className="staff-employees-page__actions">
                        <button
                          type="button"
                          className="staff-employees-page__edit-button"
                          onClick={() =>
                            onEdit(employee)
                          }
                          disabled={
                            isChangingStatus ||
                            isResendingInvitation
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="staff-employees-page__invitation-button"
                          onClick={() =>
                            onResendInvitation(
                              employee
                            )
                          }
                          disabled={
                            isResendingInvitation
                          }
                        >
                          {resendingEmployeeId ===
                          employee.id
                            ? 'Sending...'
                            : 'Resend Invitation'}
                        </button>

                        <button
                          type="button"
                          className={
                            employee.isActive
                              ? 'staff-employees-page__status-button staff-employees-page__status-button--deactivate'
                              : 'staff-employees-page__status-button staff-employees-page__status-button--activate'
                          }
                          onClick={() =>
                            onChangeStatus(employee)
                          }
                          disabled={
                            isChangingStatus ||
                            isResendingInvitation
                          }
                        >
                          {employee.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  )
}
