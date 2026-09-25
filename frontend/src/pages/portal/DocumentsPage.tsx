import { FormEvent, useState } from 'react'
import { useMyClientProfile } from '../../features/clients/useMyClientProfile'
import { CaseStatus } from '../../features/cases/case.types'
import { useMyTaxCases } from '../../features/cases/useMyTaxCases'
import { useMyDocuments } from '../../features/documents/useMyDocuments'
import { useUploadDocument } from '../../features/documents/useUploadDocument'
import { useDownloadDocument } from '../../features/documents/useDownloadDocument'
import './DocumentsPage.css'

function getCaseStatusLabel(status: CaseStatus | number) {
  switch (status) {
    case CaseStatus.Draft:
      return 'Draft'

    case CaseStatus.Open:
      return 'Open'

    case CaseStatus.InProgress:
      return 'In Progress'

    case CaseStatus.WaitingForClient:
      return 'Waiting for You'

    case CaseStatus.Completed:
      return 'Completed'

    case CaseStatus.Cancelled:
      return 'Cancelled'

    default:
      return 'Unknown'
  }
}

function getCaseStatusClassName(status: CaseStatus | number) {
  switch (status) {
    case CaseStatus.Draft:
      return 'documents-page__status documents-page__status--draft'

    case CaseStatus.Open:
      return 'documents-page__status documents-page__status--open'

    case CaseStatus.InProgress:
      return 'documents-page__status documents-page__status--progress'

    case CaseStatus.WaitingForClient:
      return 'documents-page__status documents-page__status--waiting'

    case CaseStatus.Completed:
      return 'documents-page__status documents-page__status--completed'

    case CaseStatus.Cancelled:
      return 'documents-page__status documents-page__status--cancelled'

    default:
      return 'documents-page__status'
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }

  const megabytes = kilobytes / 1024

  return `${megabytes.toFixed(2)} MB`
}

export default function DocumentsPage() {
  const { data: client, isLoading: isClientLoading } =
    useMyClientProfile()

  const {
    data: taxCases,
    isLoading: areTaxCasesLoading,
    isError: areTaxCasesError,
  } = useMyTaxCases()

  const {
    data: documents,
    isLoading: areDocumentsLoading,
    isError: areDocumentsError,
  } = useMyDocuments()

  const uploadDocument = useUploadDocument()
  const downloadDocument = useDownloadDocument()

  const [file, setFile] = useState<File | null>(null)
  const [taxCaseId, setTaxCaseId] = useState('')
  const [downloadingDocumentId, setDownloadingDocumentId] =
    useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!client || !file) {
      return
    }

    try {
      await uploadDocument.mutateAsync({
        taxCaseId: taxCaseId || null,
        file,
      })

      setFile(null)
      setTaxCaseId('')
    } catch {
      // Error is handled by the mutation state.
    }
  }

  async function handleDownload(
    id: string,
    fileName: string
  ) {
    try {
      setDownloadingDocumentId(id)

      await downloadDocument.mutateAsync({
        id,
        fileName,
      })
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  if (isClientLoading) {
    return (
      <section className="documents-page">
        <div className="documents-page__container">
          <div className="documents-page__state">
            Loading...
          </div>
        </div>
      </section>
    )
  }

  if (!client) {
    return (
      <section className="documents-page">
        <div className="documents-page__container">
          <div className="documents-page__state documents-page__state--error">
            We couldn't load your account information.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="documents-page">
      <div className="documents-page__container">
        <div className="documents-page__header">
          <span className="documents-page__eyebrow">
            MY DOCUMENTS
          </span>

          <h1 className="documents-page__title">
            Upload a Document
          </h1>

          <p className="documents-page__description">
            Upload documents securely for your tax services.
          </p>
        </div>

        <div className="documents-page__card">
          <form
            className="documents-page__form"
            onSubmit={handleSubmit}
          >
            <div className="documents-page__field">
              <label
                className="documents-page__label"
                htmlFor="document-file"
              >
                Select document
              </label>

              <input
                id="document-file"
                className="documents-page__file-input"
                type="file"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  uploadDocument.reset()
                }}
              />
            </div>

            <div className="documents-page__field">
              <label
                className="documents-page__label"
                htmlFor="tax-case"
              >
                Tax Case
                <span className="documents-page__optional">
                  {' '}
                  (optional)
                </span>
              </label>

              {areTaxCasesLoading ? (
                <div className="documents-page__field-state">
                  Loading your tax cases...
                </div>
              ) : areTaxCasesError ? (
                <div className="documents-page__field-state documents-page__field-state--error">
                  We couldn't load your tax cases.
                </div>
              ) : (
                <select
                  id="tax-case"
                  className="documents-page__input"
                  value={taxCaseId}
                  onChange={(event) => {
                    setTaxCaseId(event.target.value)
                    uploadDocument.reset()
                  }}
                >
                  <option value="">
                    General document — no tax case
                  </option>

                  {taxCases?.map((taxCase) => (
                    <option
                      key={taxCase.id}
                      value={taxCase.id}
                    >
                      {taxCase.serviceName} — {taxCase.taxYear} —{' '}
                      {getCaseStatusLabel(taxCase.status)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {file && (
              <div className="documents-page__selected-file">
                Selected file: {file.name}
              </div>
            )}

            {uploadDocument.isSuccess && (
              <div className="documents-page__message documents-page__message--success">
                Document uploaded successfully.
              </div>
            )}

            {uploadDocument.isError && (
              <div className="documents-page__message documents-page__message--error">
                {uploadDocument.error instanceof Error
                  ? uploadDocument.error.message
                  : 'We could not upload your document.'}
              </div>
            )}

            <button
              className="documents-page__submit"
              type="submit"
              disabled={
                !file ||
                uploadDocument.isPending ||
                areTaxCasesLoading
              }
            >
              {uploadDocument.isPending
                ? 'Uploading...'
                : 'Upload Document'}
            </button>
          </form>
        </div>

        <div className="documents-page__list-section">
          <div className="documents-page__list-header">
            <h2 className="documents-page__list-title">
              Your Documents
            </h2>

            <p className="documents-page__list-description">
              Documents you have uploaded to your account.
            </p>
          </div>

          {areDocumentsLoading && (
            <div className="documents-page__state">
              Loading documents...
            </div>
          )}

          {areDocumentsError && (
            <div className="documents-page__state documents-page__state--error">
              We couldn't load your documents.
            </div>
          )}

          {downloadDocument.isError && (
            <div className="documents-page__message documents-page__message--error">
              {downloadDocument.error instanceof Error
                ? downloadDocument.error.message
                : 'We could not download the document.'}
            </div>
          )}

          {!areDocumentsLoading &&
            !areDocumentsError &&
            documents?.length === 0 && (
              <div className="documents-page__empty">
                You haven't uploaded any documents yet.
              </div>
            )}

          {!areDocumentsLoading &&
            !areDocumentsError &&
            documents &&
            documents.length > 0 && (
              <div className="documents-page__list">
                {documents.map((document) => (
                  <div
                    className="documents-page__document"
                    key={document.id}
                  >
                    <div className="documents-page__document-info">
                      <div className="documents-page__document-name">
                        {document.fileName}
                      </div>

                      {document.taxCaseId ? (
                        <>
                          <div className="documents-page__document-service">
                            {document.serviceName ||
                              'Tax Service'}
                          </div>

                          <div className="documents-page__document-details">
                            {document.taxYear && (
                              <span>
                                Tax Year {document.taxYear}
                              </span>
                            )}

                            {document.caseStatus != null && (
                              <span
                                className={getCaseStatusClassName(
                                  document.caseStatus
                                )}
                              >
                                {getCaseStatusLabel(
                                  document.caseStatus
                                )}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="documents-page__document-service">
                          General Document
                        </div>
                      )}

                      <div className="documents-page__document-meta">
                        Uploaded{' '}
                        {new Date(
                          document.uploadedAt
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="documents-page__document-actions">
                      <div className="documents-page__document-size">
                        {formatFileSize(document.fileSize)}
                      </div>

                      <button
                        className="documents-page__download"
                        type="button"
                        disabled={
                          downloadingDocumentId === document.id
                        }
                        onClick={() =>
                          handleDownload(
                            document.id,
                            document.fileName
                          )
                        }
                      >
                        {downloadingDocumentId === document.id
                          ? 'Downloading...'
                          : 'Download'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </section>
  )
}