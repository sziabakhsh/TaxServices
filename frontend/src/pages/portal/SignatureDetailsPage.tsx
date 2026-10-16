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

import { getStatusLabel, getStatusClassName, SignatureDocumentSection, SignatureMetadataSection, SignatureSignSection, SignatureResultSection } from './SignatureDetailsSections'
import './SignatureDetailsPage.css'

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

      <SignatureDocumentSection signature={signature} downloadDocument={downloadDocument} handleViewDocument={handleViewDocument} />
      <SignatureMetadataSection signature={signature} />
      {isPending ? (
        <SignatureSignSection
          signerName={signerName} setSignerName={setSignerName}
          signatureText={signatureText} setSignatureText={setSignatureText}
          consentAccepted={consentAccepted} setConsentAccepted={setConsentAccepted}
          showDeclineForm={showDeclineForm} setShowDeclineForm={setShowDeclineForm}
          declineReason={declineReason} setDeclineReason={setDeclineReason}
          signSignature={signSignature} declineSignature={declineSignature}
          handleSign={handleSign} handleDecline={handleDecline}
        />
      ) : (
        <SignatureResultSection signature={signature} />
      )}
    </section>
  )
}