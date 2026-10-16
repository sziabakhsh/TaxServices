import type { DocumentItem } from '../../../features/documents/documents.types'

function formatFileSize(fileSize: number) {
  if (fileSize < 1024) return `${fileSize} B`
  if (fileSize < 1024 * 1024) return `${(fileSize / 1024).toFixed(1)} KB`
  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
}

function formatUploadDate(uploadedAt: string) {
  return new Date(uploadedAt).toLocaleDateString()
}

interface TaxCaseDocumentsProps {
  documents?: DocumentItem[]
  areDocumentsLoading: boolean
  areDocumentsError: boolean
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  isUploading: boolean
  uploadSuccess: boolean
  uploadError: boolean
  isDeleting: boolean
  deletingDocumentId?: string
  deleteError: boolean
  downloadingDocumentId: string | null
  onUpload: () => void
  onDownload: (documentId: string, fileName: string) => void
  onDelete: (documentId: string, fileName: string) => void
}

export default function TaxCaseDocuments({
  documents, areDocumentsLoading, areDocumentsError,
  selectedFile, setSelectedFile, isUploading, uploadSuccess, uploadError,
  isDeleting, deletingDocumentId, deleteError, downloadingDocumentId,
  onUpload, onDownload, onDelete,
}: TaxCaseDocumentsProps) {
  return (
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
                disabled={isUploading}
              />
            </div>

            <button
              type="button"
              className="staff-tax-case-details__upload-button"
              onClick={onUpload}
              disabled={
                !selectedFile ||
                isUploading
              }
            >
              {isUploading
                ? 'Uploading...'
                : 'Upload Document'}
            </button>
          </div>

          {uploadSuccess && (
            <p className="staff-tax-case-details__success">
              Document uploaded successfully.
            </p>
          )}

          {uploadError && (
            <p className="staff-tax-case-details__error">
              Failed to upload document.
            </p>
          )}

          {deleteError && (
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
                                onDownload(
                                  document.id,
                                  document.fileName
                                )
                              }
                              disabled={
                                downloadingDocumentId ===
                                  document.id ||
                                isDeleting
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
                                onDelete(
                                  document.id,
                                  document.fileName
                                )
                              }
                              disabled={
                                isDeleting ||
                                downloadingDocumentId ===
                                  document.id
                              }
                            >
                              {isDeleting &&
                              deletingDocumentId === document.id
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
  )
}
