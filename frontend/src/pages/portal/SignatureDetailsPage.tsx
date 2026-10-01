import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import { useDownloadDocument } from '../../features/documents/useDownloadDocument'

import {
  SignatureStatus,
} from '../../features/signatures/signature.types'

import { useMyDocumentSignature } from '../../features/signatures/useMyDocumentSignature'
import { useMarkSignatureAsViewed } from '../../features/signatures/useMarkSignatureAsViewed'
import { useSignDocumentSignature } from '../../features/signatures/useSignDocumentSignature'
import { useDeclineDocumentSignature } from '../../features/signatures/useDeclineDocumentSignature'

import './SignatureDetailsPage.css'

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

function getStatusClassName(
  status: SignatureStatus
) {
  switch (status) {
    case SignatureStatus.Pending:
      return 'signature-details__status signature-details__status--pending'

    case SignatureStatus.Signed:
      return 'signature-details__status signature-details__status--signed'

    case SignatureStatus.Declined:
      return 'signature-details__status signature-details__status--declined'

    case SignatureStatus.Cancelled:
      return 'signature-details__status signature-details__status--cancelled'

    default:
      return 'signature-details__status'
  }
}

function formatDate(date?: string | null) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleString()
}

export default function SignatureDetailsPage() {
  const { id } = useParams()

  const {
    data: signature,
    isLoading,
    isError,
  } = useMyDocumentSignature(id)

  const markAsViewed =
    useMarkSignatureAsViewed()

  const signSignature =
    useSignDocumentSignature()

  const declineSignature =
    useDeclineDocumentSignature()

  const downloadDocument =
    useDownloadDocument()

  const viewRegisteredRef = useRef(false)

  const [signerName, setSignerName] =
    useState('')

  const [signatureText, setSignatureText] =
    useState('')

  const [consentAccepted, setConsentAccepted] =
    useState(false)

  const [showDeclineForm, setShowDeclineForm] =
    useState(false)

  const [declineReason, setDeclineReason] =
    useState('')

  useEffect(() => {
    if (
      !signature ||
      signature.status !== SignatureStatus.Pending ||
      signature.viewedAt ||
      viewRegisteredRef.current
    ) {
      return
    }

    viewRegisteredRef.current = true

    markAsViewed.mutate(signature.id)
  }, [signature, markAsViewed])

  async function handleViewDocument() {
    if (!signature) {
      return
    }

    try {
      await downloadDocument.mutateAsync({
        id: signature.documentId,
        fileName: signature.fileName,
      })
    } catch {
      // Mutation state displays the error.
    }
  }

  async function handleSign(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (
      !signature ||
      !signerName.trim() ||
      !signatureText.trim() ||
      !consentAccepted
    ) {
      return
    }

    try {
      await signSignature.mutateAsync({
        signatureId: signature.id,

        request: {
          signerName: signerName.trim(),
          signatureText: signatureText.trim(),
          consentAccepted,
        },
      })
    } catch {
      // Mutation state displays the error.
    }
  }

  async function handleDecline() {
    if (
        !signature ||
        !declineReason.trim()
    ) {
        return
    }

    try {
        await declineSignature.mutateAsync({
        signatureId: signature.id,

        request: {
            reason: declineReason.trim(),
        },
        })

        setShowDeclineForm(false)
    } catch {
        // Mutation state displays the error.
    }
  }

  if (isLoading) {
    return (
      <section className="signature-details">
        <div className="signature-details__state">
          Loading signature request...
        </div>
      </section>
    )
  }

  if (isError || !signature) {
    return (
      <section className="signature-details">
        <div className="signature-details__state signature-details__state--error">
          We couldn't load this signature request.
        </div>
      </section>
    )
  }

  const isPending =
    signature.status === SignatureStatus.Pending

  return (
    <section className="signature-details">
      <div className="signature-details__top">
        <Link
          to="/portal/signatures"
          className="signature-details__back"
        >
          ← Back to Signatures
        </Link>

        <div className="signature-details__heading">
          <div>
            <span className="signature-details__eyebrow">
              DIGITAL SIGNATURE
            </span>

            <h1>
              {signature.fileName}
            </h1>

            <p>
              Review the document and signature
              request details below.
            </p>
          </div>

          <span
            className={getStatusClassName(
              signature.status
            )}
          >
            {getStatusLabel(signature.status)}
          </span>
        </div>
      </div>

      <div className="signature-details__card">
        <h2>Document</h2>

        <div className="signature-details__document">
          <div>
            <strong>
              {signature.fileName}
            </strong>

            <span>
              Requested{' '}
              {formatDate(signature.requestedAt)}
            </span>
          </div>

          <button
            type="button"
            className="signature-details__secondary-button"
            disabled={downloadDocument.isPending}
            onClick={handleViewDocument}
          >
            {downloadDocument.isPending
              ? 'Opening...'
              : 'View / Download Document'}
          </button>
        </div>

        {downloadDocument.isError && (
          <div className="signature-details__error">
            We couldn't open the document.
          </div>
        )}
      </div>

      <div className="signature-details__card">
        <h2>Signature Request</h2>

        <dl className="signature-details__metadata">
          <div>
            <dt>Status</dt>
            <dd>
              {getStatusLabel(signature.status)}
            </dd>
          </div>

          <div>
            <dt>Requested</dt>
            <dd>
              {formatDate(signature.requestedAt)}
            </dd>
          </div>

          <div>
            <dt>Viewed</dt>
            <dd>
              {formatDate(signature.viewedAt)}
            </dd>
          </div>

          {signature.signedAt && (
            <div>
              <dt>Signed</dt>
              <dd>
                {formatDate(signature.signedAt)}
              </dd>
            </div>
          )}

          {signature.declinedAt && (
            <div>
              <dt>Declined</dt>
              <dd>
                {formatDate(signature.declinedAt)}
              </dd>
            </div>
          )}

          {signature.cancelledAt && (
            <div>
              <dt>Cancelled</dt>
              <dd>
                {formatDate(signature.cancelledAt)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {isPending ? (
        <div className="signature-details__card">
          <h2>Sign Document</h2>

          <p className="signature-details__intro">
            Please review the document before
            providing your electronic signature.
          </p>

          <form
            className="signature-details__form"
            onSubmit={handleSign}
          >
            <div className="signature-details__field">
              <label htmlFor="signature-signer-name">
                Full Name
              </label>

              <input
                id="signature-signer-name"
                type="text"
                value={signerName}
                autoComplete="name"
                onChange={(event) => {
                  setSignerName(
                    event.target.value
                  )

                  signSignature.reset()
                }}
              />
            </div>

            <div className="signature-details__field">
              <label htmlFor="signature-text">
                Electronic Signature
              </label>

              <input
                id="signature-text"
                type="text"
                value={signatureText}
                placeholder="Type your full name"
                onChange={(event) => {
                  setSignatureText(
                    event.target.value
                  )

                  signSignature.reset()
                }}
              />

              <span className="signature-details__hint">
                Type your name as your electronic
                signature.
              </span>
            </div>

            <label className="signature-details__consent">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(event) => {
                  setConsentAccepted(
                    event.target.checked
                  )

                  signSignature.reset()
                }}
              />

              <span>
                I have reviewed this document and
                consent to use my electronic
                signature for this document.
              </span>
            </label>

            {signSignature.isError && (
              <div className="signature-details__error">
                We couldn't sign the document. The
                request may no longer be pending.
              </div>
            )}

            <div className="signature-details__actions">
              <button
                type="button"
                className="signature-details__decline-button"
                disabled={
                  signSignature.isPending ||
                  declineSignature.isPending
                }
                onClick={() => {
                  setShowDeclineForm(true)
                  declineSignature.reset()
                }}
              >
                Decline
              </button>

              <button
                type="submit"
                className="signature-details__sign-button"
                disabled={
                  !signerName.trim() ||
                  !signatureText.trim() ||
                  !consentAccepted ||
                  signSignature.isPending ||
                  declineSignature.isPending
                }
              >
                {signSignature.isPending
                  ? 'Signing...'
                  : 'Sign Document'}
              </button>
            </div>
          </form>

          {showDeclineForm && (
            <div className="signature-details__decline">
              <h3>Decline Signature Request</h3>

              <p>
                You can provide a reason for
                declining this request.
              </p>

              <div className="signature-details__field">
                <label htmlFor="decline-reason">
                    Reason
                </label>

                <textarea
                  id="decline-reason"
                  rows={4}
                  value={declineReason}
                  onChange={(event) => {
                    setDeclineReason(
                      event.target.value
                    )

                    declineSignature.reset()
                  }}
                />
              </div>

              {declineSignature.isError && (
                <div className="signature-details__error">
                  We couldn't decline the request.
                  It may no longer be pending.
                </div>
              )}

              <div className="signature-details__actions">
                <button
                  type="button"
                  className="signature-details__secondary-button"
                  disabled={
                    declineSignature.isPending
                  }
                  onClick={() =>
                    setShowDeclineForm(false)
                  }
                >
                  Keep Request
                </button>

                <button
                    type="button"
                    className="signature-details__decline-button"
                    disabled={
                        !declineReason.trim() ||
                        declineSignature.isPending
                    }
                    onClick={handleDecline}
                    >
                    {declineSignature.isPending
                        ? 'Declining...'
                        : 'Confirm Decline'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="signature-details__card">
          <h2>Signature Details</h2>

          {signature.status ===
            SignatureStatus.Signed && (
            <div className="signature-details__result">
              <div>
                <span>Signed by</span>
                <strong>
                  {signature.signerName || '—'}
                </strong>
              </div>

              <div>
                <span>Electronic Signature</span>
                <strong>
                  {signature.signatureText || '—'}
                </strong>
              </div>

              <div>
                <span>Signed</span>
                <strong>
                  {formatDate(
                    signature.signedAt
                  )}
                </strong>
              </div>
            </div>
          )}

          {signature.status ===
            SignatureStatus.Declined && (
            <div className="signature-details__result">
              <div>
                <span>Declined</span>
                <strong>
                  {formatDate(
                    signature.declinedAt
                  )}
                </strong>
              </div>

              <div>
                <span>Reason</span>
                <strong>
                  {signature.declineReason ||
                    'No reason provided'}
                </strong>
              </div>
            </div>
          )}

          {signature.status ===
            SignatureStatus.Cancelled && (
            <p className="signature-details__intro">
              This signature request was cancelled
              and can no longer be signed.
            </p>
          )}
        </div>
      )}
    </section>
  )
}