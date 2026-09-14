import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useClient } from '../../features/clients/useClient'
import { useClientDocuments } from '../../features/documents/useClientDocuments'
import { useUploadClientDocument } from '../../features/documents/useUploadClientDocument'
import { downloadClientDocument } from '../../features/documents/documents.api'
import './StaffClientDocumentsPage.css'

import { useClientTaxCases } from '../../features/cases/useClientTaxCases'

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 KB'

  const kilobytes = bytes / 1024

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(1)} KB`
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

function getCaseStatusLabel(status?: number | null) {
  switch (status) {
    case 1:
      return 'Draft'

    case 2:
      return 'Open'

    case 3:
      return 'In Progress'

    case 4:
      return 'Waiting for Client'

    case 5:
      return 'Completed'

    case 6:
      return 'Cancelled'

    default:
      return null
  }
}

export default function StaffClientDocumentsPage() {
  const { clientId } = useParams()

  const [file, setFile] = useState<File | null>(null)
  const [taxCaseId, setTaxCaseId] = useState('')

  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useClient(clientId)

  const {
    data: documents,
    isLoading: areDocumentsLoading,
    isError: areDocumentsError,
  } = useClientDocuments(clientId)

  const {
    data: taxCases,
    isLoading: areTaxCasesLoading,
    isError: areTaxCasesError,
  } = useClientTaxCases(clientId)

  const uploadDocument = useUploadClientDocument()

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!clientId || !file) {
      return
    }

    try {
      await uploadDocument.mutateAsync({
        clientId,
        file,
        taxCaseId: taxCaseId.trim() || undefined,
      })

      setFile(null)
      setTaxCaseId('')

      const fileInput = document.getElementById(
        'staff-document-file'
      ) as HTMLInputElement | null

      if (fileInput) {
        fileInput.value = ''
      }
    } catch {
      // Error state is handled below.
    }
  }

  async function handleDownload(
    documentId: string,
    fileName: string
  ) {
    try {
      await downloadClientDocument(documentId, fileName)
    } catch {
      alert('Unable to download the document.')
    }
  }

if (  isClientLoading || areDocumentsLoading ||  areTaxCasesLoading) {
    return (
      <section className="staff-client-documents">
        <div className="staff-client-documents__state">
          Loading client documents...
        </div>
      </section>
    )
  }

if (
  isClientError ||
  areDocumentsError ||
  areTaxCasesError ||
  !client
) {
    return (
      <section className="staff-client-documents">
        <div className="staff-client-documents__state staff-client-documents__state--error">
          We couldn't load this client's documents.
        </div>
      </section>
    )
  }

  return (
    <section className="staff-client-documents">
      <div className="staff-client-documents__header">
        <div>
          <span className="staff-client-documents__eyebrow">
            CLIENT DOCUMENTS
          </span>

          <h1>
            Documents — {client.firstName} {client.lastName}
          </h1>

          <p>{client.email}</p>
        </div>

        <Link
          to="/staff/clients"
          className="staff-client-documents__back"
        >
          Back to Clients
        </Link>
      </div>

      <div className="staff-client-documents__upload">
        <div className="staff-client-documents__upload-header">
          <h2>Upload Document</h2>

          <p>
            Upload a document for this client. Linking it to a tax
            case is optional.
          </p>
        </div>

        <form
          className="staff-client-documents__upload-form"
          onSubmit={handleUpload}
        >
          <div className="staff-client-documents__field">
            <label htmlFor="staff-document-file">
              File
            </label>

            <input
              id="staff-document-file"
              type="file"
              onChange={(event) =>
                setFile(event.target.files?.[0] ?? null)
              }
            />
          </div>

          <div className="staff-client-documents__field">
            <label htmlFor="staff-document-tax-case">
              Tax Case
            </label>

            <select
              id="staff-document-tax-case"
              value={taxCaseId}
              onChange={(event) =>
                setTaxCaseId(event.target.value)
              }
            >
              <option value="">
                Not linked to a tax case
              </option>

              {taxCases?.map((taxCase) => (
                <option
                  key={taxCase.id}
                  value={taxCase.id}
                >
                  {taxCase.taxYear} — {getCaseStatusLabel(taxCase.status)}
                </option>
              ))}
            </select>

            <span className="staff-client-documents__field-help">
              Optional. Select the tax case this document belongs to.
            </span>
          </div>
          <button
            type="submit"
            className="staff-client-documents__upload-button"
            disabled={!file || uploadDocument.isPending}
          >
            {uploadDocument.isPending
              ? 'Uploading...'
              : 'Upload Document'}
          </button>
        </form>

        {uploadDocument.isSuccess && (
          <div className="staff-client-documents__message staff-client-documents__message--success">
            Document uploaded successfully.
          </div>
        )}

        {uploadDocument.isError && (
          <div className="staff-client-documents__message staff-client-documents__message--error">
            Unable to upload the document. Please check the file and
            tax case and try again.
          </div>
        )}
      </div>

      {!documents?.length ? (
        <div className="staff-client-documents__state">
          No documents found for this client.
        </div>
      ) : (
        <div className="staff-client-documents__table-wrapper">
          <table className="staff-client-documents__table">
            <thead>
              <tr>
                <th>File</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Tax Case</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => {
                const caseStatus =
                  getCaseStatusLabel(document.caseStatus)

                return (
                  <tr key={document.id}>
                    <td>
                      <strong>{document.fileName}</strong>
                    </td>

                    <td>
                      {formatFileSize(document.fileSize)}
                    </td>

                    <td>
                      {formatDate(document.uploadedAt)}
                    </td>

                    <td>
                      {document.taxCaseId ? (
                        <span>
                          {document.taxYear ?? '—'}

                          {caseStatus && (
                            <>
                              {' • '}
                              {caseStatus}
                            </>
                          )}
                        </span>
                      ) : (
                        <span>Not linked</span>
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="staff-client-documents__download"
                        onClick={() =>
                          handleDownload(
                            document.id,
                            document.fileName
                          )
                        }
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}