import type { FormEvent, Dispatch, SetStateAction } from 'react'
import { Check, X } from 'lucide-react'
import type { Service } from '../../../features/services/service.types'

export interface ServiceFormState {
  name: string
  description: string
  basePrice: string
}

interface Props {
  editingService: Service | null
  form: ServiceFormState
  setForm: Dispatch<SetStateAction<ServiceFormState>>
  formError: string | null
  isSaving: boolean
  closeForm: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function ServiceForm({ editingService, form, setForm, formError, isSaving, closeForm, handleSubmit }: Props) {
  return (
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
  )
}
