export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}
