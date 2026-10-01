import { SignatureStatus } from './signature.types'
import { useDocumentSignatures } from './useDocumentSignatures'
import { useRequestDocumentSignature } from './useRequestDocumentSignature'
import { useCancelDocumentSignature } from './useCancelDocumentSignature'

import './StaffDocumentSignature.css'

interface StaffDocumentSignatureProps {
  documentId: string
}

function getSignatureStatusLabel(
  status: SignatureStatus
) {
  switch (status) {
    case SignatureStatus.Pending:
      return 'Pending'

    case SignatureStatus.Signed:
      return 'Signed'

    case SignatureStatus.Declined:
      return 'Declined'

    case SignatureStatus.Cancelled:
      return 'Cancelled'

    default:
      return 'Unknown'
  }
}

function getSignatureStatusClassName(
  status: SignatureStatus
) {
  switch (status) {
    case SignatureStatus.Pending:
      return 'staff-signature__status staff-signature__status--pending'

    case SignatureStatus.Signed:
      return 'staff-signature__status staff-signature__status--signed'

    case SignatureStatus.Declined:
      return 'staff-signature__status staff-signature__status--declined'

    case SignatureStatus.Cancelled:
      return 'staff-signature__status staff-signature__status--cancelled'

    default:
      return 'staff-signature__status'
  }
}

function formatDate(date?: string | null) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleString()
}

export default function StaffDocumentSignature({
  documentId,
}: StaffDocumentSignatureProps) {
  const {
    data: signatures,
    isLoading,
    isError,
  } = useDocumentSignatures(documentId)

  const requestSignature =
    useRequestDocumentSignature()

  const cancelSignature =
    useCancelDocumentSignature()

  if (isLoading) {
    return (
      <div className="staff-signature">
        <span className="staff-signature__loading">
          Loading...
        </span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="staff-signature">
        <span className="staff-signature__error">
          Unable to load
        </span>
      </div>
    )
  }

  const orderedSignatures = [
    ...(signatures ?? []),
  ].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() -
      new Date(a.requestedAt).getTime()
  )

  const latestSignature = orderedSignatures[0]

  const pendingSignature =
    orderedSignatures.find(
      (signature) =>
        signature.status === SignatureStatus.Pending
    )

  async function handleRequestSignature() {
    if (pendingSignature) {
      return
    }

    try {
      await requestSignature.mutateAsync({
        documentId,
      })
    } catch {
      // Mutation state displays the error.
    }
  }

  async function handleCancelSignature() {
    if (!pendingSignature) {
      return
    }

    try {
      await cancelSignature.mutateAsync(
        pendingSignature.id
      )
    } catch {
      // Mutation state displays the error.
    }
  }

  if (!latestSignature) {
    return (
      <div className="staff-signature">
        <span className="staff-signature__none">
          Not requested
        </span>

        <button
          type="button"
          className="staff-signature__button"
          disabled={requestSignature.isPending}
          onClick={handleRequestSignature}
        >
          {requestSignature.isPending
            ? 'Requesting...'
            : 'Request Signature'}
        </button>

        {requestSignature.isError && (
          <span className="staff-signature__error">
            Request failed.
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="staff-signature">
      <div className="staff-signature__summary">
        <span
          className={getSignatureStatusClassName(
            latestSignature.status
          )}
        >
          {getSignatureStatusLabel(
            latestSignature.status
          )}
        </span>

        <span className="staff-signature__date">
          Requested{' '}
          {formatDate(
            latestSignature.requestedAt
          )}
        </span>
      </div>

      {latestSignature.status ===
        SignatureStatus.Signed && (
        <div className="staff-signature__details">
          {latestSignature.signerName && (
            <span>
              Signed by{' '}
              <strong>
                {latestSignature.signerName}
              </strong>
            </span>
          )}

          <span>
            Signed{' '}
            {formatDate(
              latestSignature.signedAt
            )}
          </span>
        </div>
      )}

      {latestSignature.status ===
        SignatureStatus.Declined && (
        <div className="staff-signature__details">
          <span>
            Declined{' '}
            {formatDate(
              latestSignature.declinedAt
            )}
          </span>

          {latestSignature.declineReason && (
            <span>
              Reason:{' '}
              {latestSignature.declineReason}
            </span>
          )}
        </div>
      )}

      {latestSignature.status ===
        SignatureStatus.Cancelled && (
        <div className="staff-signature__details">
          <span>
            Cancelled{' '}
            {formatDate(
              latestSignature.cancelledAt
            )}
          </span>
        </div>
      )}

      <div className="staff-signature__actions">
        {pendingSignature ? (
          <button
            type="button"
            className="staff-signature__cancel-button"
            disabled={cancelSignature.isPending}
            onClick={handleCancelSignature}
          >
            {cancelSignature.isPending
              ? 'Cancelling...'
              : 'Cancel Request'}
          </button>
        ) : (
          <button
            type="button"
            className="staff-signature__button"
            disabled={requestSignature.isPending}
            onClick={handleRequestSignature}
          >
            {requestSignature.isPending
              ? 'Requesting...'
              : 'Request Again'}
          </button>
        )}
      </div>

      {requestSignature.isError && (
        <span className="staff-signature__error">
          We couldn't request the signature.
        </span>
      )}

      {cancelSignature.isError && (
        <span className="staff-signature__error">
          We couldn't cancel the request.
        </span>
      )}
    </div>
  )
}