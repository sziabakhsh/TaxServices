import InvoiceNumberInput from './InvoiceNumberInput'
import type { InvoiceItemForm, InvoiceServiceOption } from './invoiceFormTypes'

interface Props {
  items: InvoiceItemForm[]
  services: InvoiceServiceOption[]
  servicesLoading: boolean
  isPending: boolean
  selectService: (index: number, serviceId: string) => void
  updateItem: (index: number, field: keyof InvoiceItemForm, value: string | number | null) => void
  removeItem: (index: number) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value)
}

export default function InvoiceItems({ items, services, servicesLoading, isPending, selectService, updateItem, removeItem }: Props) {
  return (
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
                          isPending
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
                          isPending
                        }
                        required
                      />
                    </label>

                    <label className="create-invoice-page__field">
                      Quantity

                      <InvoiceNumberInput min={0.01} step={0.01} value={item.quantity} onChange={value => updateItem(index, 'quantity', value)} disabled={isPending} required />
                    </label>

                    <label className="create-invoice-page__field">
                      Unit Price

                      <InvoiceNumberInput min={0} step={0.01} value={item.unitPrice} onChange={value => updateItem(index, 'unitPrice', value)} disabled={isPending} required />
                    </label>

                    <label className="create-invoice-page__field">
                      Discount

                      <InvoiceNumberInput min={0} max={grossAmount} step={0.01} value={item.discountAmount} onChange={value => updateItem(index, 'discountAmount', value)} disabled={isPending} />
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
                        isPending
                      }
                    >
                      Remove
                    </button>
                  </div>
                )
              }
            )}
          </div>
  )
}
