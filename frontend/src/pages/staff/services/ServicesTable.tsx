import { Pencil, Power, PowerOff } from 'lucide-react'
import type { Service } from '../../../features/services/service.types'

interface Props {
  services: Service[]
  isAdmin: boolean
  openEditForm: (service: Service) => void
  handleToggleStatus: (service: Service) => void
  activatingId?: string
  deactivatingId?: string
}

export default function ServicesTable({ services, isAdmin, openEditForm, handleToggleStatus, activatingId, deactivatingId }: Props) {
  if (!services.length) return <div className="staff-services__empty">No services have been added yet.</div>
  return (
        <div className="staff-services__table-wrapper">

          <table className="staff-services__table">

            <thead>

              <tr>

                <th>Service</th>

                <th>Description</th>

                <th>Base Price</th>

                <th>Status</th>

                {isAdmin && (
                  <th className="staff-services__actions">

                  Actions

                </th>
                )}

              </tr>

            </thead>

            <tbody>

              {services.map((service) => {

                const isChangingStatus =

                  activatingId === service.id || deactivatingId === service.id

                return (

                  <tr key={service.id}>

                    <td>

                      <strong>{service.name}</strong>

                    </td>

                    <td className="staff-services__description">

                      {service.description || '—'}

                    </td>

                    <td>

                      {service.basePrice != null

                        ? `$${service.basePrice.toFixed(2)}`

                        : '—'}

                    </td>

                    <td>

                      <span

                        className={

                          service.isActive

                            ? 'staff-services__status staff-services__status--active'

                            : 'staff-services__status staff-services__status--inactive'

                        }

                      >

                        {service.isActive

                          ? 'Active'

                          : 'Inactive'}

                      </span>

                    </td>

                                        {isAdmin && (
                      <td className="staff-services__actions">
                      
                                            <div className="staff-services__action-buttons">
                      
                                              <button
                      
                                                type="button"
                      
                                                className="staff-services__action-button"
                      
                                                onClick={() =>
                      
                                                  openEditForm(service)
                      
                                                }
                      
                                                aria-label={`Edit ${service.name}`}
                      
                                                title="Edit service"
                      
                                              >
                      
                                                <Pencil size={17} />
                      
                                                <span>Edit</span>
                      
                                              </button>
                      
                                              <button
                      
                                                type="button"
                      
                                                className={
                      
                                                  service.isActive
                      
                                                    ? 'staff-services__action-button staff-services__action-button--danger'
                      
                                                    : 'staff-services__action-button staff-services__action-button--activate'
                      
                                                }
                      
                                                onClick={() =>
                      
                                                  handleToggleStatus(service)
                      
                                                }
                      
                                                disabled={isChangingStatus}
                      
                                                aria-label={
                      
                                                  service.isActive
                      
                                                    ? `Deactivate ${service.name}`
                      
                                                    : `Activate ${service.name}`
                      
                                                }
                      
                                              >
                      
                                                {service.isActive ? (
                      
                                                  <PowerOff size={17} />
                      
                                                ) : (
                      
                                                  <Power size={17} />
                      
                                                )}
                      
                                                <span>
                      
                                                  {isChangingStatus
                      
                                                    ? 'Updating...'
                      
                                                    : service.isActive
                      
                                                      ? 'Deactivate'
                      
                                                      : 'Activate'}
                      
                                                </span>
                      
                                              </button>
                      
                                            </div>
                      
                                          </td>
                    )}

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>
  )
}
