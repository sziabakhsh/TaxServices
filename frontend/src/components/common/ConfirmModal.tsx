import './ConfirmModal.css'

type ConfirmModalProps = {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isPending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="confirm-modal__backdrop">
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2
          id="confirm-modal-title"
          className="confirm-modal__title"
        >
          {title}
        </h2>

        <p className="confirm-modal__message">
          {message}
        </p>

        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__cancel"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-modal__confirm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}