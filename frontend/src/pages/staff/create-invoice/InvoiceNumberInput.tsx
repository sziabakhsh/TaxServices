import { useState } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
}

export default function InvoiceNumberInput({ value, onChange, min, max, step = 0.01, disabled, required }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft === null ? value : draft}
      onFocus={() => setDraft(value === 0 ? '' : String(value))}
      onChange={event => {
        const next = event.target.value
        setDraft(next)
        if (next !== '' && Number.isFinite(Number(next))) {
          onChange(Number(next))
        } else if (next === '') {
          onChange(0)
        }
      }}
      onBlur={() => setDraft(null)}
      disabled={disabled}
      required={required}
    />
  )
}
