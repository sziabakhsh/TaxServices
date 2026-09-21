import { useState } from 'react'
import { useDocuments } from '../../features/documents/useDocuments'

export default function StaffDocumentsPage() {
  const [pageNumber, setPageNumber] = useState(1)

  const { data, isLoading, isError } = useDocuments({
    pageNumber,
    pageSize: 20,
  })

  if (isLoading) {
    return <p>Loading documents...</p>
  }

  if (isError) {
    return <p>Unable to load documents.</p>
  }

  return (
    <div className="staff-documents">
      <div className="staff-documents__header">
        <div>
          <h1>Documents</h1>
          <p>
            View and manage documents across your clients.
          </p>
        </div>
      </div>

      <div className="staff-documents__summary">
        {data?.totalCount ?? 0} documents
      </div>

      <div className="staff-documents__list">
        {data?.items.map((document) => (
          <div
            key={document.id}
            className="staff-documents__item"
          >
            <strong>{document.fileName}</strong>

            <span>
              {document.taxYear ?? 'No tax year'}
            </span>
          </div>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="staff-documents__pagination">
          <button
            type="button"
            disabled={pageNumber === 1}
            onClick={() =>
              setPageNumber((current) => current - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {data.pageNumber} of {data.totalPages}
          </span>

          <button
            type="button"
            disabled={pageNumber >= data.totalPages}
            onClick={() =>
              setPageNumber((current) => current + 1)
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}