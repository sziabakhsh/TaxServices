import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '../../components/common/Pagination'

import ConfirmModal from '../../components/common/ConfirmModal'

import { CaseStatus } from '../../features/cases/case.types'
import { useClientTaxCases } from '../../features/cases/useClientTaxCases'

import {
  downloadClientDocument,
} from '../../features/documents/documents.api'

import type { DocumentItem } from '../../features/documents/documents.types'

import { useDocuments } from '../../features/documents/useDocuments'
import { useDeleteDocument } from '../../features/documents/useDeleteDocument'
import { useAssignDocumentToCase } from '../../features/documents/useAssignDocumentToCase'

import './StaffDocumentsPage.css'

const currentYear = new Date().getFullYear()

const taxYears = Array.from(
  { length: currentYear - 2000 + 1 },
  (_, index) => currentYear - index
)

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusLabel(status?: number | null) {
  switch (status) {
    case CaseStatus.Draft:
      return 'Draft'

    case CaseStatus.Open:
      return 'Open'

    case CaseStatus.InProgress:
      return 'In Progress'

    case CaseStatus.WaitingForClient:
      return 'Waiting for Client'

    case CaseStatus.Completed:
      return 'Completed'

    case CaseStatus.Cancelled:
      return 'Cancelled'

    default:
      return '—'
  }
}

function getStatusClassName(status?: number | null) {
  switch (status) {
    case CaseStatus.Draft:
      return 'staff-documents__status staff-documents__status--draft'

    case CaseStatus.Open:
      return 'staff-documents__status staff-documents__status--open'

    case CaseStatus.InProgress:
      return 'staff-documents__status staff-documents__status--progress'

    case CaseStatus.WaitingForClient:
      return 'staff-documents__status staff-documents__status--waiting'

    case CaseStatus.Completed:
      return 'staff-documents__status staff-documents__status--completed'

    case CaseStatus.Cancelled:
      return 'staff-documents__status staff-documents__status--cancelled'

    default:
      return 'staff-documents__status'
  }
}

export default function StaffDocumentsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [taxYear, setTaxYear] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentItem | null>(null)

  const [documentToAssign, setDocumentToAssign] =
    useState<DocumentItem | null>(null)

  const [selectedTaxCaseId, setSelectedTaxCaseId] =
    useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPageNumber(1)
    }, 400)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [search])

  const {
    data,
    isLoading,
    isError,
  } = useDocuments({
    pageNumber,
    pageSize: 20,
    search: debouncedSearch,
    taxYear: taxYear
      ? Number(taxYear)
      : undefined,
  })

  const deleteDocument = useDeleteDocument()
  const assignDocumentToCase = useAssignDocumentToCase()

  const {
    data: clientTaxCases,
    isLoading: areClientTaxCasesLoading,
  } = useClientTaxCases(documentToAssign?.clientId)

  async function handleDownload(
    document: DocumentItem
  ) {
    await downloadClientDocument(
      document.id,
      document.fileName
    )
  }

  function openAssignCase(document: DocumentItem) {
    setDocumentToAssign(document)
    setSelectedTaxCaseId(document.taxCaseId ?? '')
    assignDocumentToCase.reset()
  }

  function cancelAssignCase() {
    if (assignDocumentToCase.isPending) {
      return
    }

    setDocumentToAssign(null)
    setSelectedTaxCaseId('')
    assignDocumentToCase.reset()
  }

  async function saveAssignedCase() {
    if (!documentToAssign) {
      return
    }

    try {
      await assignDocumentToCase.mutateAsync({
        documentId: documentToAssign.id,
        taxCaseId: selectedTaxCaseId || null,
      })

      setDocumentToAssign(null)
      setSelectedTaxCaseId('')
    } catch {
      // Mutation state displays the error.
    }
  }

  async function confirmDelete() {
    if (!documentToDelete) {
      return
    }

    const isLastItemOnPage =
      data?.items.length === 1 && pageNumber > 1

    try {
      await deleteDocument.mutateAsync(
        documentToDelete.id
      )

      setDocumentToDelete(null)

      if (isLastItemOnPage) {
        setPageNumber((current) => current - 1)
      }
    } catch {
      // Mutation state displays the error.
    }
  }

  function cancelDelete() {
    if (deleteDocument.isPending) {
      return
    }

    setDocumentToDelete(null)
  }

  if (isLoading && !data) {
    return (
      <section className="staff-documents">
        <div className="staff-documents__state">
          Loading documents...
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="staff-documents">
        <div className="staff-documents__state">
          Unable to load documents.
        </div>
      </section>
    )
  }

  return (
    <section className="staff-documents">
      <div className="staff-documents__header">
        <div>
          <h1>Documents</h1>

          <p>
            View and manage documents across your clients.
          </p>
        </div>
      </div>

      <div className="staff-documents__filters">
        <div className="staff-documents__search">
          <label htmlFor="document-search">
            Search Documents
          </label>

          <input
            id="document-search"
            type="search"
            value={search}
            placeholder="Search by file name..."
            onChange={(event) => {
              setSearch(event.target.value)
            }}
          />
        </div>

        <div className="staff-documents__filter">
          <label htmlFor="document-tax-year">
            Tax Year
          </label>

          <select
            id="document-tax-year"
            value={taxYear}
            onChange={(event) => {
              setTaxYear(event.target.value)
              setPageNumber(1)
            }}
          >
            <option value="">
              All Tax Years
            </option>

            {taxYears.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="staff-documents__summary">
        {data?.totalCount ?? 0} documents
      </div>

      {!data?.items.length ? (
        <div className="staff-documents__empty">
          No documents found.
        </div>
      ) : (
        <div className="staff-documents__table-wrapper">
          <table className="staff-documents__table">
            <thead>
              <tr>
                <th>File</th>
                <th>Client</th>
                <th>Tax Year</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.items.map((document) => (
                <tr key={document.id}>
                  <td>
                    <strong>
                      {document.fileName}
                    </strong>
                  </td>

                  <td>
                    <Link
                      to={`/staff/clients/${document.clientId}/documents`}
                      className="staff-documents__link"
                    >
                      {document.clientName ||
                        'View Client'}
                    </Link>
                  </td>

                  <td>
                    {document.taxYear ?? '—'}
                  </td>

                  <td>
                    <span
                      className={getStatusClassName(
                        document.caseStatus
                      )}
                    >
                      {getStatusLabel(
                        document.caseStatus
                      )}
                    </span>
                  </td>

                  <td>
                    {new Date(
                      document.uploadedAt
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {formatFileSize(
                      document.fileSize
                    )}
                  </td>

                  <td>
                    <div className="staff-documents__actions">
                      {document.taxCaseId && (
                        <Link
                          to={`/staff/cases/${document.taxCaseId}`}
                          state={{
                            from: '/staff/documents',
                          }}
                          className="staff-documents__action-link"
                        >
                          Case
                        </Link>
                      )}

                      <button
                        type="button"
                        className="staff-documents__action-button"
                        disabled={
                          assignDocumentToCase.isPending
                        }
                        onClick={() =>
                          openAssignCase(document)
                        }
                      >
                        {document.taxCaseId
                          ? 'Change Case'
                          : 'Assign Case'}
                      </button>

                      <button
                        type="button"
                        className="staff-documents__action-button"
                        onClick={() =>
                          handleDownload(document)
                        }
                      >
                        Download
                      </button>

                      <button
                        type="button"
                        className="staff-documents__delete-button"
                        disabled={
                          deleteDocument.isPending
                        }
                        onClick={() => {
                          deleteDocument.reset()
                          setDocumentToDelete(
                            document
                          )
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && (
  <Pagination
    pageNumber={data.pageNumber}
    totalPages={data.totalPages}
    onPageChange={setPageNumber}
  />
)}
      {deleteDocument.isError && (
        <div className="staff-documents__delete-error">
          We couldn't delete the document.
          Please try again.
        </div>
      )}

      {documentToAssign && (
        <div className="staff-documents__modal-backdrop">
          <div className="staff-documents__modal">
            <h2>
              {documentToAssign.taxCaseId
                ? 'Change Case'
                : 'Assign Case'}
            </h2>

            <p>
              Select a tax case for{' '}
              <strong>
                {documentToAssign.fileName}
              </strong>.
            </p>

            {areClientTaxCasesLoading ? (
              <p>Loading cases...</p>
            ) : (
              <div className="staff-documents__modal-field">
                <label htmlFor="document-tax-case">
                  Tax Case
                </label>

                <select
                  id="document-tax-case"
                  value={selectedTaxCaseId}
                  onChange={(event) =>
                    setSelectedTaxCaseId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    No Case
                  </option>

                  {clientTaxCases?.map((taxCase) => (
                    <option
                      key={taxCase.id}
                      value={taxCase.id}
                    >
                      {taxCase.taxYear} -{' '}
                      {getStatusLabel(
                        taxCase.status
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {assignDocumentToCase.isError && (
              <div className="staff-documents__delete-error">
                We couldn't update the document case.
                Please try again.
              </div>
            )}

            <div className="staff-documents__modal-actions">
              <button
                type="button"
                disabled={
                  assignDocumentToCase.isPending
                }
                onClick={cancelAssignCase}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  areClientTaxCasesLoading ||
                  assignDocumentToCase.isPending
                }
                onClick={saveAssignedCase}
              >
                {assignDocumentToCase.isPending
                  ? 'Saving...'
                  : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={documentToDelete !== null}
        title="Delete Document"
        message={
          documentToDelete
            ? `Are you sure you want to delete "${documentToDelete.fileName}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        isPending={deleteDocument.isPending}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  )
}