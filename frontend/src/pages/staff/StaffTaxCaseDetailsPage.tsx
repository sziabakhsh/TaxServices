import { useEffect, useState } from 'react'
import {
  Link,
  useLocation,
  useParams,
} from 'react-router-dom'

import { useClient } from '../../features/clients/useClient'
import { useTaxCase } from '../../features/cases/useTaxCase'
import { useUpdateTaxCase } from '../../features/cases/useUpdateTaxCase'
import { useEmployeeOptions } from '../../features/employees/useEmployeeOptions'
import { useServices } from '../../features/services/useServices'
import { useTaxCaseDocuments } from '../../features/documents/useTaxCaseDocuments'
import { useUploadClientDocument } from '../../features/documents/useUploadClientDocument'
import { useDeleteClientDocument } from '../../features/documents/useDeleteClientDocument'
import { downloadClientDocument } from '../../features/documents/documents.api'

import { CaseStatus } from '../../features/cases/case.types'

import TaxCaseInformation from './taxCaseDetails/TaxCaseInformation'
import TaxCaseEditForm from './taxCaseDetails/TaxCaseEditForm'
import TaxCaseDocuments from './taxCaseDetails/TaxCaseDocuments'

import './StaffTaxCaseDetailsPage.css'

export default function StaffTaxCaseDetailsPage() {
  const { id } = useParams<{ id: string }>()

  const location = useLocation()

  const navigationState = location.state as
    | {
        from?: string
      }
    | null

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
  } = useEmployeeOptions()

  const {
    data: services,
    isLoading: areServicesLoading,
    isError: areServicesError,
  } = useServices()

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
  const [serviceId, setServiceId] = useState('')

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
      setServiceId(taxCase.serviceId)
    }
  }, [taxCase])

  function handleSaveChanges() {
    if (!taxCase || !id || !serviceId) {
      return
    }

    updateTaxCase.mutate({
      id,
      request: {
        serviceId,
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
        </div>
      </section>
    )
  }

  const backTo =
    navigationState?.from ??
    `/staff/clients/${taxCase.clientId}/cases`

  const backLabel =
    navigationState?.from === '/staff/documents'
      ? 'Back to Documents'
      : 'Back to Client Cases'

  const assignedEmployee = employees?.find(
    (employee) => employee.id === taxCase.employeeId
  )

  const activeEmployees = employees?.filter(
    (employee) =>
      employee.isActive ||
      employee.id === taxCase.employeeId
  )

  const availableServices = services?.filter(
    (service) =>
      service.isActive ||
      service.id === taxCase.serviceId
  )

  const hasChanges =
    serviceId !== taxCase.serviceId ||
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
            to={backTo}
            className="staff-tax-case-details__back-link"
          >
            {backLabel}
          </Link>
        </div>

        {/* Case Information */}
        <TaxCaseInformation
          taxCase={taxCase}
          client={client}
          assignedEmployee={assignedEmployee}
          isClientLoading={isClientLoading}
          isClientError={isClientError}
          areEmployeesLoading={areEmployeesLoading}
          areEmployeesError={areEmployeesError}
          areServicesError={areServicesError}
        />

        {/* Edit Tax Case */}

        <TaxCaseEditForm
          serviceId={serviceId}
          setServiceId={setServiceId}
          taxYear={taxYear}
          setTaxYear={setTaxYear}
          status={status}
          setStatus={setStatus}
          employeeId={employeeId}
          setEmployeeId={setEmployeeId}
          description={description}
          setDescription={setDescription}
          availableServices={availableServices}
          activeEmployees={activeEmployees}
          areServicesLoading={areServicesLoading}
          areServicesError={areServicesError}
          areEmployeesLoading={areEmployeesLoading}
          areEmployeesError={areEmployeesError}
          isSaving={updateTaxCase.isPending}
          hasChanges={hasChanges}
          isSuccess={updateTaxCase.isSuccess}
          isError={updateTaxCase.isError}
          onSave={handleSaveChanges}
        />

        {/* Documents */}
        <TaxCaseDocuments
          documents={documents}
          areDocumentsLoading={areDocumentsLoading}
          areDocumentsError={areDocumentsError}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          isUploading={uploadDocument.isPending}
          uploadSuccess={uploadDocument.isSuccess}
          uploadError={uploadDocument.isError}
          isDeleting={deleteDocument.isPending}
          deletingDocumentId={deleteDocument.variables?.documentId}
          deleteError={deleteDocument.isError}
          downloadingDocumentId={downloadingDocumentId}
          onUpload={handleUploadDocument}
          onDownload={handleDownload}
          onDelete={handleDeleteDocument}
        />
      </div>
    </section>
  )
}