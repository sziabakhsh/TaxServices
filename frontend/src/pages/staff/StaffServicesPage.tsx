import { FormEvent, useState } from 'react'

import { AxiosError } from 'axios'

import { Plus } from 'lucide-react'

import { useAuth } from '../../features/auth/useAuth'
import { useServices } from '../../features/services/useServices'

import { useCreateService } from '../../features/services/useCreateService'

import { useUpdateService } from '../../features/services/useUpdateService'

import {

  useActivateService,

  useDeactivateService,

} from '../../features/services/useServiceStatus'

import type { Service } from '../../features/services/service.types'

import './StaffServicesPage.css'
import ServiceForm, { type ServiceFormState } from './services/ServiceForm'
import ServicesTable from './services/ServicesTable'

const emptyForm: ServiceFormState = {

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
  const { user } = useAuth()
  const isAdmin = user?.roles.includes('Admin') ?? false

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

    useState<ServiceFormState>(emptyForm)

  const [formError, setFormError] =

    useState<string | null>(null)

  const [statusError, setStatusError] =

    useState<string | null>(null)

  const isSaving =

    createService.isPending ||

    updateService.isPending

  function openCreateForm() {
    if (!isAdmin) return

    setEditingService(null)

    setForm(emptyForm)

    setFormError(null)

    setIsFormOpen(true)

  }

  function openEditForm(service: Service) {
    if (!isAdmin) return

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

    if (!isAdmin) return

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
    if (!isAdmin) return

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

            {isAdmin
              ? 'Manage the services offered to clients.'
              : 'View the services offered to clients.'}

          </p>

        </div>

        {isAdmin && (
          <button

          type="button"

          className="staff-services__add-button"

          onClick={openCreateForm}

        >

          <Plus size={18} />

          <span>Add Service</span>

        </button>
        )}

      </header>

      {isAdmin && isFormOpen && (
        <ServiceForm
          editingService={editingService}
          form={form}
          setForm={setForm}
          formError={formError}
          isSaving={isSaving}
          closeForm={closeForm}
          handleSubmit={handleSubmit}
        />
      )}

      {statusError && (

        <div className="staff-services__error">

          {statusError}

        </div>

      )}

      <ServicesTable
        services={services ?? []}
        isAdmin={isAdmin}
        openEditForm={openEditForm}
        handleToggleStatus={handleToggleStatus}
        activatingId={activateService.isPending ? activateService.variables : undefined}
        deactivatingId={deactivateService.isPending ? deactivateService.variables : undefined}
      />

    </section>

  )

}