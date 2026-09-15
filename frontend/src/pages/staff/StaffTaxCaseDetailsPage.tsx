import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useClient } from '../../features/clients/useClient'
import { useTaxCase } from '../../features/cases/useTaxCase'
import { useUpdateTaxCase } from '../../features/cases/useUpdateTaxCase'
import { useEmployees } from '../../features/employees/useEmployees'
import { useTaxCaseDocuments } from '../../features/documents/useTaxCaseDocuments'
import { useUploadClientDocument } from '../../features/documents/useUploadClientDocument'
import { useDeleteClientDocument } from '../../features/documents/useDeleteClientDocument'
import { downloadClientDocument } from '../../features/documents/documents.api'

import { CaseStatus } from '../../features/cases/case.types'

import './StaffTaxCaseDetailsPage.css'

function getStatusLabel(status: CaseStatus) {
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
      return 'Unknown'
  }
}

function formatFileSize(fileSize: number) {
  if (fileSize < 1024) {
    return `${fileSize} B`
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
}

function formatUploadDate(uploadedAt: string) {
  return new Date(uploadedAt).toLocaleDateString()
}

export default function StaffTaxCaseDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: taxCase,
    isLoading,
    isError,
  } = useTaxCase(id)

  const {
    data: client,
    isLoading: isClientLoading,
    isError: isClientError,
  } = useClient(taxCase?.clientId)

  const {
    data: employees,
    isLoading: areEmployeesLoading,
    isError: areEmployeesError,
  } = useEmployees()

  const {
    data: documents,
    isLoading: areDocumentsLoading,
    isError: areDocumentsError,
  } = useTaxCaseDocuments(id)

  const updateTaxCase = useUpdateTaxCase()
  const uploadDocument = useUploadClientDocument()
  const deleteDocument = useDeleteClientDocument()

  const [taxYear, setTaxYear] = useState(
    new Date().getFullYear()
  )

  const [status, setStatus] = useState<CaseStatus>(
    CaseStatus.Open
  )

  const [description, setDescription] = useState('')
  const [employeeId, setEmployeeId] = useState('')

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [downloadingDocumentId, setDownloadingDocumentId] =
    useState<string | null>(null)

  useEffect(() => {
    if (taxCase) {
      setTaxYear(taxCase.taxYear)
      setStatus(taxCase.status)
      setDescription(taxCase.description)
      setEmployeeId(taxCase.employeeId ?? '')
    }
  }, [taxCase])

  function handleSaveChanges() {
    if (!taxCase || !id) {
      return
    }

    updateTaxCase.mutate({
      id,
      request: {
        employeeId: employeeId || null,
        taxYear,
        status,
        description: description.trim(),
      },
    })
  }

  async function handleUploadDocument() {
    if (!taxCase || !id || !selectedFile) {
      return
    }

    try {
      await uploadDocument.mutateAsync({
        clientId: taxCase.clientId,
        taxCaseId: id,
        file: selectedFile,
      })

      setSelectedFile(null)
    } catch {
      // Error state is displayed below.
    }
  }

  async function handleDownload(
    documentId: string,
    fileName: string
  ) {
    try {
      setDownloadingDocumentId(documentId)

      await downloadClientDocument(
        documentId,
        fileName
      )
    } finally {
      setDownloadingDocumentId(null)
    }
  }

  async function handleDeleteDocument(
    documentId: string,
    fileName: string
  ) {
    if (!taxCase || !id) {
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteDocument.mutateAsync({
        documentId,
        clientId: taxCase.clientId,
        taxCaseId: id,
      })
    } catch {
      // Error state is displayed below.
    }
  }

  if (isLoading) {
    return (
      <section className="staff-tax-case-details">
        <div className="staff-tax-case-details__container">
          <p className="staff-tax-case-details__state">
            Loading tax case...
          </p>
        </div>
      </section>
    )
  }

  if (isError || !taxCase) {
    return (
      <section className="staff-tax-case-details">
        <div className="staff-tax-case-details__container">
          <p className="staff-tax-case-details__state staff-tax-case-details__state--error">
            Tax case could not be loaded.
          </p>

          <Link
            to="/staff"
            className="staff-tax-case-details__back-link"
          >
            Back to Staff Panel
          </Link>
        </div>
      </section>
    )
  }

  const assignedEmployee = employees?.find(
    (employee) => employee.id === taxCase.employeeId
  )

  const activeEmployees = employees?.filter(
    (employee) =>
      employee.isActive ||
      employee.id === taxCase.employeeId
  )

  const hasChanges =
    taxYear !== taxCase.taxYear ||
    status !== taxCase.status ||
    description.trim() !== taxCase.description ||
    employeeId !== (taxCase.employeeId ?? '')

  return (
    <section className="staff-tax-case-details">
      <div className="staff-tax-case-details__container">
        <div className="staff-tax-case-details__header">
          <div>
            <span className="staff-tax-case-details__eyebrow">
              TAX CASE
            </span>

            <h1 className="staff-tax-case-details__title">
              Tax Case Details
            </h1>

            <p className="staff-tax-case-details__subtitle">
              Review and manage this client's tax case.
            </p>
          </div>

          <Link
            to={`/staff/clients/${taxCase.clientId}/cases`}
            className="staff-tax-case-details__back-link"
          >
            Back to Client Cases
          </Link>
        </div>

        {/* Case Information */}

        <div className="staff-tax-case-details__card">
          <div className="staff-tax-case-details__grid">
            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Tax Year
              </span>

              <span className="staff-tax-case-details__value">
                {taxCase.taxYear}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Current Status
              </span>

              <span className="staff-tax-case-details__value">
                {getStatusLabel(taxCase.status)}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Client
              </span>

              <span className="staff-tax-case-details__value">
                {isClientLoading
                  ? 'Loading...'
                  : client
                    ? `${client.firstName} ${client.lastName}`
                    : 'Unavailable'}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Email
              </span>

              <span className="staff-tax-case-details__value">
                {isClientLoading
                  ? 'Loading...'
                  : client?.email ?? 'Unavailable'}
              </span>
            </div>

            <div className="staff-tax-case-details__info">
              <span className="staff-tax-case-details__label">
                Employee
              </span>

              <span className="staff-tax-case-details__value">
                {areEmployeesLoading
                  ? 'Loading...'
                  : assignedEmployee
                    ? `${assignedEmployee.firstName} ${assignedEmployee.lastName}`
                    : 'Not assigned'}
              </span>
            </div>
          </div>

          <div className="staff-tax-case-details__description">
            <span className="staff-tax-case-details__label">
              Description
            </span>

            <p className="staff-tax-case-details__description-text">
              {taxCase.description ||
                'No description provided.'}
            </p>
          </div>

          {isClientError && (
            <p className="staff-tax-case-details__error">
              Client information could not be loaded.
            </p>
          )}

          {areEmployeesError && (
            <p className="staff-tax-case-details__error">
              Employee information could not be loaded.
            </p>
          )}
        </div>

        {/* Edit Tax Case */}

        <div className="staff-tax-case-details__card">
          <h2 className="staff-tax-case-details__section-title">
            Edit Tax Case
          </h2>

          <p className="staff-tax-case-details__section-description">
            Update the tax year, status, employee, or description.
          </p>

          <div className="staff-tax-case-details__edit-grid">
            <div className="staff-tax-case-details__field">
              <label
                htmlFor="taxYear"
                className="staff-tax-case-details__label"
              >
                Tax Year
              </label>

              <input
                id="taxYear"
                type="number"
                min="2000"
                max="2100"
                className="staff-tax-case-details__input"
                value={taxYear}
                onChange={(event) =>
                  setTaxYear(Number(event.target.value))
                }
                disabled={updateTaxCase.isPending}
              />
            </div>

            <div className="staff-tax-case-details__field">
              <label
                htmlFor="status"
                className="staff-tax-case-details__label"
              >
                Case Status
              </label>

              <select
                id="status"
                className="staff-tax-case-details__select"
                value={status}
                onChange={(event) =>
                  setStatus(
                    Number(event.target.value) as CaseStatus
                  )
                }
                disabled={updateTaxCase.isPending}
              >
                <option value={CaseStatus.Draft}>
                  Draft
                </option>

                <option value={CaseStatus.Open}>
                  Open
                </option>

                <option value={CaseStatus.InProgress}>
                  In Progress
                </option>

                <option value={CaseStatus.WaitingForClient}>
                  Waiting for Client
                </option>

                <option value={CaseStatus.Completed}>
                  Completed
                </option>

                <option value={CaseStatus.Cancelled}>
                  Cancelled
                </option>
              </select>
            </div>

            <div className="staff-tax-case-details__field">
              <label
                htmlFor="employee"
                className="staff-tax-case-details__label"
              >
                Assigned Employee
              </label>

              <select
                id="employee"
                className="staff-tax-case-details__select"
                value={employeeId}
                onChange={(event) =>
                  setEmployeeId(event.target.value)
                }
                disabled={
                  updateTaxCase.isPending ||
                  areEmployeesLoading ||
                  areEmployeesError
                }
              >
                <option value="">
                  Not assigned
                </option>

                {activeEmployees?.map((employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.firstName}{' '}
                    {employee.lastName}
                    {employee.jobTitle
                      ? ` — ${employee.jobTitle}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="staff-tax-case-details__field staff-tax-case-details__field--description">
              <label
                htmlFor="description"
                className="staff-tax-case-details__label"
              >
                Description
              </label>

              <textarea
                id="description"
                className="staff-tax-case-details__textarea"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                maxLength={2000}
                rows={5}
                disabled={updateTaxCase.isPending}
              />
            </div>
          </div>

          <div className="staff-tax-case-details__actions">
            <button
              type="button"
              className="staff-tax-case-details__save-button"
              onClick={handleSaveChanges}
              disabled={
                updateTaxCase.isPending ||
                !hasChanges ||
                taxYear < 2000 ||
                taxYear > 2100
              }
            >
              {updateTaxCase.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>

          {updateTaxCase.isSuccess && (
            <p className="staff-tax-case-details__success">
              Tax case updated successfully.
            </p>
          )}

          {updateTaxCase.isError && (
            <p className="staff-tax-case-details__error">
              Failed to update tax case.
            </p>
          )}
        </div>

        {/* Documents */}

        <div className="staff-tax-case-details__card">
          <h2 className="staff-tax-case-details__section-title">
            Documents
          </h2>

          <p className="staff-tax-case-details__section-description">
            Upload and manage documents attached to this tax case.
          </p>

          <div className="staff-tax-case-details__document-upload">
            <div className="staff-tax-case-details__document-file">
              <label
                htmlFor="caseDocument"
                className="staff-tax-case-details__label"
              >
                Select File
              </label>

              <input
                id="caseDocument"
                type="file"
                className="staff-tax-case-details__file-input"
                onChange={(event) =>
                  setSelectedFile(
                    event.target.files?.[0] ?? null
                  )
                }
                disabled={uploadDocument.isPending}
              />
            </div>

            <button
              type="button"
              className="staff-tax-case-details__upload-button"
              onClick={handleUploadDocument}
              disabled={
                !selectedFile ||
                uploadDocument.isPending
              }
            >
              {uploadDocument.isPending
                ? 'Uploading...'
                : 'Upload Document'}
            </button>
          </div>

          {uploadDocument.isSuccess && (
            <p className="staff-tax-case-details__success">
              Document uploaded successfully.
            </p>
          )}

          {uploadDocument.isError && (
            <p className="staff-tax-case-details__error">
              Failed to upload document.
            </p>
          )}

          {deleteDocument.isError && (
            <p className="staff-tax-case-details__error">
              Failed to delete document.
            </p>
          )}

          {areDocumentsLoading && (
            <p className="staff-tax-case-details__state">
              Loading documents...
            </p>
          )}

          {areDocumentsError && (
            <p className="staff-tax-case-details__error">
              Documents could not be loaded.
            </p>
          )}

          {!areDocumentsLoading &&
            !areDocumentsError &&
            documents?.length === 0 && (
              <p className="staff-tax-case-details__state">
                No documents are attached to this tax case.
              </p>
            )}

          {!areDocumentsLoading &&
            !areDocumentsError &&
            documents &&
            documents.length > 0 && (
              <div className="staff-tax-case-details__documents-wrapper">
                <table className="staff-tax-case-details__documents-table">
                  <thead>
                    <tr>
                      <th>File Name</th>
                      <th>File Size</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td>{document.fileName}</td>

                        <td>
                          {formatFileSize(
                            document.fileSize
                          )}
                        </td>

                        <td>
                          {formatUploadDate(
                            document.uploadedAt
                          )}
                        </td>

                        <td>
                          <div className="staff-tax-case-details__document-actions">
                            <button
                              type="button"
                              className="staff-tax-case-details__download-button"
                              onClick={() =>
                                handleDownload(
                                  document.id,
                                  document.fileName
                                )
                              }
                              disabled={
                                downloadingDocumentId ===
                                  document.id ||
                                deleteDocument.isPending
                              }
                            >
                              {downloadingDocumentId ===
                              document.id
                                ? 'Downloading...'
                                : 'Download'}
                            </button>

                            <button
                              type="button"
                              className="staff-tax-case-details__delete-button"
                              onClick={() =>
                                handleDeleteDocument(
                                  document.id,
                                  document.fileName
                                )
                              }
                              disabled={
                                deleteDocument.isPending ||
                                downloadingDocumentId ===
                                  document.id
                              }
                            >
                              {deleteDocument.isPending &&
                              deleteDocument.variables
                                ?.documentId === document.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </section>
  )
}