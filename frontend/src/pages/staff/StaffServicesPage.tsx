import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import {
  Check,
  Pencil,
  Plus,
  Power,
  PowerOff,
  X,
} from 'lucide-react'

import { useServices } from '../../features/services/useServices'
import { useCreateService } from '../../features/services/useCreateService'
import { useUpdateService } from '../../features/services/useUpdateService'
import {
  useActivateService,
  useDeactivateService,
} from '../../features/services/useServiceStatus'
import type { Service } from '../../features/services/service.types'

import './StaffServicesPage.css'

interface FormState {
  name: string
  description: string
  basePrice: string
}

const emptyForm: FormState = {
  name: '',
  description: '',
  basePrice: '',
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | {
          detail?: string
          title?: string
        }
      | undefined

    return (
      data?.detail ||
      data?.title ||
      'Unable to complete the request.'
    )
  }

  return 'Unable to complete the request.'
}

export default function StaffServicesPage() {
  const {
    data: services,
    isLoading,
    isError,
  } = useServices()

  const createService = useCreateService()
  const updateService = useUpdateService()
  const activateService = useActivateService()
  const deactivateService = useDeactivateService()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] =
    useState<Service | null>(null)

  const [form, setForm] =
    useState<FormState>(emptyForm)

  const [formError, setFormError] =
    useState<string | null>(null)

  const [statusError, setStatusError] =
    useState<string | null>(null)

  const isSaving =
    createService.isPending ||
    updateService.isPending

  function openCreateForm() {
    setEditingService(null)
    setForm(emptyForm)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditForm(service: Service) {
    setEditingService(service)

    setForm({
      name: service.name,
      description: service.description ?? '',
      basePrice:
        service.basePrice != null
          ? String(service.basePrice)
          : '',
    })

    setFormError(null)
    setIsFormOpen(true)
  }

  function closeForm() {
    if (isSaving) {
      return
    }

    setIsFormOpen(false)
    setEditingService(null)
    setForm(emptyForm)
    setFormError(null)
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setFormError(null)

    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      setFormError('Service name is required.')
      return
    }

    let basePrice: number | null = null

    if (form.basePrice.trim()) {
      basePrice = Number(form.basePrice)

      if (
        Number.isNaN(basePrice) ||
        basePrice < 0
      ) {
        setFormError(
          'Base price must be a valid positive number.'
        )
        return
      }
    }

    try {
      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          request: {
            name,
            description,
            basePrice,
          },
        })
      } else {
        await createService.mutateAsync({
          name,
          description,
          basePrice,
        })
      }

      setIsFormOpen(false)
      setEditingService(null)
      setForm(emptyForm)
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  async function handleToggleStatus(
    service: Service
  ) {
    setStatusError(null)

    try {
      if (service.isActive) {
        await deactivateService.mutateAsync(
          service.id
        )
      } else {
        await activateService.mutateAsync(
          service.id
        )
      }
    } catch (error) {
      setStatusError(getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <p className="staff-services__message">
        Loading services...
      </p>
    )
  }

  if (isError) {
    return (
      <div className="staff-services__error">
        Unable to load services.
      </div>
    )
  }

  return (
    <section className="staff-services">
      <header className="staff-services__header">
        <div>
          <h1 className="staff-services__title">
            Services
          </h1>

          <p className="staff-services__subtitle">
            Manage the services offered to clients.
          </p>
        </div>

        <button
          type="button"
          className="staff-services__add-button"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </header>

      {isFormOpen && (
        <div className="staff-services__form-card">
          <div className="staff-services__form-header">
            <div>
              <h2>
                {editingService
                  ? 'Edit Service'
                  : 'Add Service'}
              </h2>

              <p>
                {editingService
                  ? 'Update the service information.'
                  : 'Add a new service to your catalog.'}
              </p>
            </div>

            <button
              type="button"
              className="staff-services__close-button"
              onClick={closeForm}
              disabled={isSaving}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="staff-services__form"
            onSubmit={handleSubmit}
          >
            <div className="staff-services__field">
              <label htmlFor="service-name">
                Service Name
              </label>

              <input
                id="service-name"
                type="text"
                maxLength={150}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Personal Tax Return"
                disabled={isSaving}
              />
            </div>

            <div className="staff-services__field">
              <label htmlFor="service-price">
                Base Price
              </label>

              <div className="staff-services__price-input">
                <span>$</span>

                <input
                  id="service-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      basePrice: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="staff-services__field staff-services__field--full">
              <label htmlFor="service-description">
                Description
              </label>

              <textarea
                id="service-description"
                maxLength={1000}
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Short description of the service"
                disabled={isSaving}
              />
            </div>

            {formError && (
              <div className="staff-services__form-error">
                {formError}
              </div>
            )}

            <div className="staff-services__form-actions">
              <button
                type="button"
                className="staff-services__button staff-services__button--secondary"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="staff-services__button staff-services__button--primary"
                disabled={isSaving}
              >
                <Check size={17} />

                {isSaving
                  ? 'Saving...'
                  : editingService
                    ? 'Save Changes'
                    : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {statusError && (
        <div className="staff-services__error">
          {statusError}
        </div>
      )}

      {!services?.length ? (
        <div className="staff-services__empty">
          No services have been added yet.
        </div>
      ) : (
        <div className="staff-services__table-wrapper">
          <table className="staff-services__table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Description</th>
                <th>Base Price</th>
                <th>Status</th>
                <th className="staff-services__actions">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {services.map((service) => {
                const isChangingStatus =
                  (activateService.isPending &&
                    activateService.variables ===
                      service.id) ||
                  (deactivateService.isPending &&
                    deactivateService.variables ===
                      service.id)

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