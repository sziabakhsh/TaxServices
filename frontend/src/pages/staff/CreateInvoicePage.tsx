import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { useCreateInvoice } from '../../features/invoices/useInvoices'
import { useClients } from '../../features/clients/useClients'
import { useServices } from '../../features/services/useServices'

import './CreateInvoicePage.css'

interface InvoiceItemForm {
  serviceId: string | null
  description: string
  quantity: number
  unitPrice: number
  discountAmount: number
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(value)
}

export default function CreateInvoicePage() {
  const navigate = useNavigate()

  const createInvoice = useCreateInvoice()

  const {
    data: servicesData,
    isLoading: servicesLoading,
  } = useServices()

  const services =
    servicesData?.filter(
      service => service.isActive
    ) ?? []

  const [clientSearch, setClientSearch] =
    useState('')

  const [
    debouncedClientSearch,
    setDebouncedClientSearch,
  ] = useState('')

  const [
    clientPickerOpen,
    setClientPickerOpen,
  ] = useState(false)

  const [
    selectedClientLabel,
    setSelectedClientLabel,
  ] = useState('')

  const {
    data: clientsData,
    isLoading: clientsLoading,
    isFetching: clientsFetching,
  } = useClients({
    pageNumber: 1,
    pageSize: 10,
    search:
      debouncedClientSearch || undefined,
  })

  const [clientId, setClientId] =
    useState('')

  const [issueDate, setIssueDate] =
    useState(today())

  const [dueDate, setDueDate] =
    useState(today())

  const [taxRate, setTaxRate] =
    useState(0)

  const [notes, setNotes] =
    useState('')

  const [items, setItems] = useState<
    InvoiceItemForm[]
  >([
    {
      serviceId: null,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
    },
  ])

  const [error, setError] =
    useState('')

  const clients =
    clientsData?.items ?? []

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setDebouncedClientSearch(
          clientSearch.trim()
        )
      },
      400
    )

    return () => {
      window.clearTimeout(timeout)
    }
  }, [clientSearch])

  function selectClient(
    id: string,
    label: string
  ) {
    setClientId(id)
    setSelectedClientLabel(label)
    setClientSearch('')
    setClientPickerOpen(false)
  }

  function updateItem(
    index: number,
    field: keyof InvoiceItemForm,
    value: string | number | null
  ) {
    setItems(current =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    )
  }

  function selectService(
    index: number,
    serviceId: string
  ) {
    if (!serviceId) {
      setItems(current =>
        current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  serviceId: null,
                  description: '',
                  unitPrice: 0,
                  discountAmount: 0,
                }
              : item
        )
      )

      return
    }

    const service =
      services.find(
        item => item.id === serviceId
      )

    if (!service) {
      return
    }

    setItems(current =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                serviceId: service.id,
                description:
                  service.name,
                unitPrice:
                  service.basePrice ?? 0,
                discountAmount: 0,
              }
            : item
      )
    )
  }

  function addItem() {
    setItems(current => [
      ...current,
      {
        serviceId: null,
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountAmount: 0,
      },
    ])
  }

  function removeItem(index: number) {
    setItems(current => {
      if (current.length === 1) {
        return current
      }

      return current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    })
  }

  const subtotal = items.reduce(
    (total, item) => {
      const grossAmount =
        Number(item.quantity || 0) *
        Number(item.unitPrice || 0)

      const discountAmount =
        Number(
          item.discountAmount || 0
        )

      return (
        total +
        Math.max(
          grossAmount -
            discountAmount,
          0
        )
      )
    },
    0
  )

  const taxAmount =
    subtotal *
    (Number(taxRate || 0) / 100)

  const total =
    subtotal + taxAmount

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError('')

    if (!clientId) {
      setError(
        'Please select a client.'
      )
      return
    }

    if (!items.length) {
      setError(
        'The invoice must contain at least one item.'
      )
      return
    }

    const hasInvalidItem =
      items.some(
        item =>
          !item.description.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.unitPrice) < 0
      )

    if (hasInvalidItem) {
      setError(
        'Please complete all invoice items.'
      )
      return
    }

    const hasInvalidDiscount =
      items.some(item => {
        const grossAmount =
          Number(
            item.quantity || 0
          ) *
          Number(
            item.unitPrice || 0
          )

        const discountAmount =
          Number(
            item.discountAmount || 0
          )

        return (
          discountAmount < 0 ||
          discountAmount >
            grossAmount
        )
      })

    if (hasInvalidDiscount) {
      setError(
        'Discount cannot exceed the item amount.'
      )
      return
    }

    if (
      new Date(dueDate) <
      new Date(issueDate)
    ) {
      setError(
        'Due date cannot be before the issue date.'
      )
      return
    }

    try {
      await createInvoice.mutateAsync({
        clientId,
        issueDate,
        dueDate,
        taxRate: Number(taxRate),
        notes:
          notes.trim() || null,

        items: items.map(item => ({
          serviceId:
            item.serviceId,
          description:
            item.description.trim(),
          quantity:
            Number(item.quantity),
          unitPrice:
            Number(item.unitPrice),
          discountAmount:
            Number(
              item.discountAmount
            ),
        })),
      })

      navigate(
        '/staff/invoices',
        {
          replace: true,
        }
      )
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.detail ??
          err?.response?.data
            ?.message ??
          'We could not create the invoice. Please check the information and try again.'
      )
    }
  }

  return (
    <section className="create-invoice-page">
      <div className="create-invoice-page__header">
        <div>
          <span className="create-invoice-page__eyebrow">
            BILLING
          </span>

          <h1>New Invoice</h1>

          <p>
            Create a new invoice
            for a client.
          </p>
        </div>

        <Link
          to="/staff/invoices"
          className="create-invoice-page__back"
        >
          Back to Invoices
        </Link>
      </div>

      <form
        className="create-invoice-page__form"
        onSubmit={submit}
      >
        {error && (
          <div
            className="create-invoice-page__error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="create-invoice-page__section">
          <h2>
            Invoice Information
          </h2>

          <div className="create-invoice-page__grid">
            <div className="create-invoice-page__field create-invoice-page__field--full">
              <span>Client</span>

              {clientId ? (
                <div className="create-invoice-page__selected-client">
                  <div>
                    <strong>
                      {
                        selectedClientLabel
                      }
                    </strong>

                    <span>
                      Selected client
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setClientId('')
                      setSelectedClientLabel(
                        ''
                      )
                      setClientSearch(
                        ''
                      )
                      setClientPickerOpen(
                        true
                      )
                    }}
                    disabled={
                      createInvoice.isPending
                    }
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="create-invoice-page__client-picker">
                  <input
                    type="search"
                    value={
                      clientSearch
                    }
                    placeholder="Search by name or email..."
                    autoComplete="off"
                    onFocus={() =>
                      setClientPickerOpen(
                        true
                      )
                    }
                    onChange={
                      event => {
                        setClientSearch(
                          event.target
                            .value
                        )
                        setClientPickerOpen(
                          true
                        )
                      }
                    }
                    disabled={
                      createInvoice.isPending
                    }
                  />

                  {clientPickerOpen && (
                    <div className="create-invoice-page__client-results">
                      {clientsLoading ||
                      clientsFetching ? (
                        <div className="create-invoice-page__client-message">
                          Searching...
                        </div>
                      ) : clients.length ===
                        0 ? (
                        <div className="create-invoice-page__client-message">
                          No clients
                          found.
                        </div>
                      ) : (
                        clients.map(
                          client => {
                            const fullName =
                              `${client.firstName} ${client.lastName}`.trim()

                            const label =
                              `${fullName} — ${client.email}`

                            return (
                              <button
                                key={
                                  client.id
                                }
                                type="button"
                                className="create-invoice-page__client-option"
                                onClick={() =>
                                  selectClient(
                                    client.id,
                                    label
                                  )
                                }
                              >
                                <strong>
                                  {
                                    fullName
                                  }
                                </strong>

                                <span>
                                  {
                                    client.email
                                  }
                                </span>
                              </button>
                            )
                          }
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <label className="create-invoice-page__field">
              Issue Date

              <input
                type="date"
                value={issueDate}
                onChange={event =>
                  setIssueDate(
                    event.target.value
                  )
                }
                disabled={
                  createInvoice.isPending
                }
                required
              />
            </label>

            <label className="create-invoice-page__field">
              Due Date

              <input
                type="date"
                value={dueDate}
                onChange={event =>
                  setDueDate(
                    event.target.value
                  )
                }
                disabled={
                  createInvoice.isPending
                }
                required
              />
            </label>

            <label className="create-invoice-page__field">
              Tax Rate (%)

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={event =>
                  setTaxRate(
                    Number(
                      event.target.value
                    )
                  )
                }
                disabled={
                  createInvoice.isPending
                }
                required
              />
            </label>

            <label className="create-invoice-page__field create-invoice-page__field--full">
              Notes

              <textarea
                value={notes}
                onChange={event =>
                  setNotes(
                    event.target.value
                  )
                }
                maxLength={2000}
                rows={4}
                disabled={
                  createInvoice.isPending
                }
              />
            </label>
          </div>
        </div>

        <div className="create-invoice-page__section">
          <div className="create-invoice-page__section-header">
            <h2>
              Invoice Items
            </h2>

            <button
              type="button"
              className="create-invoice-page__add"
              onClick={addItem}
              disabled={
                createInvoice.isPending
              }
            >
              + Add Item
            </button>
          </div>

          <div className="create-invoice-page__items">
            {items.map(
              (item, index) => {
                const grossAmount =
                  Number(
                    item.quantity ||
                      0
                  ) *
                  Number(
                    item.unitPrice ||
                      0
                  )

                const discountAmount =
                  Number(
                    item.discountAmount ||
                      0
                  )

                const amount =
                  Math.max(
                    grossAmount -
                      discountAmount,
                    0
                  )

                return (
                  <div
                    key={index}
                    className="create-invoice-page__item"
                  >
                    <label className="create-invoice-page__field create-invoice-page__item-service">
                      Service

                      <select
                        value={
                          item.serviceId ??
                          ''
                        }
                        onChange={
                          event =>
                            selectService(
                              index,
                              event
                                .target
                                .value
                            )
                        }
                        disabled={
                          servicesLoading ||
                          createInvoice.isPending
                        }
                      >
                        <option value="">
                          Custom Item
                        </option>

                        {services.map(
                          service => (
                            <option
                              key={
                                service.id
                              }
                              value={
                                service.id
                              }
                            >
                              {
                                service.name
                              }
                              {service.basePrice !=
                              null
                                ? ` — ${formatCurrency(
                                    service.basePrice
                                  )}`
                                : ''}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="create-invoice-page__field create-invoice-page__item-description">
                      Description

                      <input
                        type="text"
                        value={
                          item.description
                        }
                        onChange={
                          event =>
                            updateItem(
                              index,
                              'description',
                              event
                                .target
                                .value
                            )
                        }
                        maxLength={
                          500
                        }
                        placeholder={
                          item.serviceId
                            ? undefined
                            : 'Enter custom item description'
                        }
                        disabled={
                          createInvoice.isPending
                        }
                        required
                      />
                    </label>

                    <label className="create-invoice-page__field">
                      Quantity

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          item.quantity
                        }
                        onChange={
                          event =>
                            updateItem(
                              index,
                              'quantity',
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                        }
                        disabled={
                          createInvoice.isPending
                        }
                        required
                      />
                    </label>

                    <label className="create-invoice-page__field">
                      Unit Price

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          item.unitPrice
                        }
                        onChange={
                          event =>
                            updateItem(
                              index,
                              'unitPrice',
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                        }
                        disabled={
                          createInvoice.isPending
                        }
                        required
                      />
                    </label>

                    <label className="create-invoice-page__field">
                      Discount

                      <input
                        type="number"
                        min="0"
                        max={
                          grossAmount
                        }
                        step="0.01"
                        value={
                          item.discountAmount
                        }
                        onChange={
                          event =>
                            updateItem(
                              index,
                              'discountAmount',
                              Number(
                                event
                                  .target
                                  .value
                              )
                            )
                        }
                        disabled={
                          createInvoice.isPending
                        }
                      />
                    </label>

                    <div className="create-invoice-page__amount">
                      <span>
                        Amount
                      </span>

                      <strong>
                        {formatCurrency(
                          amount
                        )}
                      </strong>

                      {discountAmount >
                        0 && (
                        <small>
                          Before
                          discount:{' '}
                          {formatCurrency(
                            grossAmount
                          )}
                        </small>
                      )}
                    </div>

                    <button
                      type="button"
                      className="create-invoice-page__remove"
                      onClick={() =>
                        removeItem(
                          index
                        )
                      }
                      disabled={
                        items.length ===
                          1 ||
                        createInvoice.isPending
                      }
                    >
                      Remove
                    </button>
                  </div>
                )
              }
            )}
          </div>
        </div>

        <div className="create-invoice-page__summary">
          <div>
            <span>Subtotal</span>

            <strong>
              {formatCurrency(
                subtotal
              )}
            </strong>
          </div>

          <div>
            <span>
              Tax ({taxRate || 0}%)
            </span>

            <strong>
              {formatCurrency(
                taxAmount
              )}
            </strong>
          </div>

          <div className="create-invoice-page__summary-total">
            <span>Total</span>

            <strong>
              {formatCurrency(
                total
              )}
            </strong>
          </div>
        </div>

        <div className="create-invoice-page__footer">
          <Link
            to="/staff/invoices"
            className="create-invoice-page__cancel"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="create-invoice-page__submit"
            disabled={
              createInvoice.isPending
            }
          >
            {createInvoice.isPending
              ? 'Creating Invoice...'
              : 'Create Invoice'}
          </button>
        </div>
      </form>
    </section>
  )
}