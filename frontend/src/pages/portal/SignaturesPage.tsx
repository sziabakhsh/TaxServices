import { Link } from 'react-router-dom'

import {
  SignatureStatus,
  type DocumentSignature,
} from '../../features/signatures/signature.types'

import { useMyDocumentSignatures } from '../../features/signatures/useMyDocumentSignatures'

import './SignaturesPage.css'

function getStatusLabel(status: SignatureStatus) {
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

function getStatusClassName(status: SignatureStatus) {
  switch (status) {
    case SignatureStatus.Pending:
      return 'client-signatures__status client-signatures__status--pending'

    case SignatureStatus.Signed:
      return 'client-signatures__status client-signatures__status--signed'

    case SignatureStatus.Declined:
      return 'client-signatures__status client-signatures__status--declined'

    case SignatureStatus.Cancelled:
      return 'client-signatures__status client-signatures__status--cancelled'

    default:
      return 'client-signatures__status'
  }
}

function formatDate(date?: string | null) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleString()
}

function getStatusDate(signature: DocumentSignature) {
  switch (signature.status) {
    case SignatureStatus.Signed:
      return signature.signedAt

    case SignatureStatus.Declined:
      return signature.declinedAt

    case SignatureStatus.Cancelled:
      return signature.cancelledAt

    default:
      return signature.requestedAt
  }
}

export default function SignaturesPage() {
  const {
    data: signatures,
    isLoading,
    isError,
  } = useMyDocumentSignatures()

  if (isLoading) {
    return (
      <section className="client-signatures">
        <div className="client-signatures__state">
          Loading signature requests...
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="client-signatures">
        <div className="client-signatures__state client-signatures__state--error">
          Unable to load signature requests.
        </div>
      </section>
    )
  }

  const orderedSignatures = [
    ...(signatures ?? []),
  ].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() -
      new Date(a.requestedAt).getTime()
  )

  return (
    <section className="client-signatures">
      <header className="client-signatures__header">
        <div>
          <h1>Signatures</h1>

          <p>
            Review and respond to documents that require
            your signature.
          </p>
        </div>
      </header>

      {!orderedSignatures.length ? (
        <div className="client-signatures__empty">
          You don't have any signature requests.
        </div>
      ) : (
        <div className="client-signatures__list">
          {orderedSignatures.map((signature) => (
            <article
              key={signature.id}
              className="client-signatures__card"
            >
              <div className="client-signatures__card-main">
                <div className="client-signatures__document">
                  <strong>
                    {signature.fileName}
                  </strong>

                  <span>
                    Requested{' '}
                    {formatDate(
                      signature.requestedAt
                    )}
                  </span>
                </div>

                <div className="client-signatures__status-area">
                  <span
                    className={getStatusClassName(
                      signature.status
                    )}
                  >
                    {getStatusLabel(
                      signature.status
                    )}
                  </span>

                  <span className="client-signatures__status-date">
                    {formatDate(
                      getStatusDate(signature)
                    )}
                  </span>
                </div>
              </div>

              <div className="client-signatures__card-actions">
                <Link
                  to={`/portal/signatures/${signature.id}`}
                  className="client-signatures__action"
                >
                  {signature.status ===
                  SignatureStatus.Pending
                    ? 'Review & Sign'
                    : 'View Details'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}