import './Pagination.css'

interface PaginationProps {
  pageNumber: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({
  pageNumber,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      className="pagination"
      aria-label="Pagination"
    >
      <button
        type="button"
        className="pagination__button"
        disabled={pageNumber === 1}
        aria-label="Previous page"
        onClick={() => onPageChange(pageNumber - 1)}
      >
        ‹
      </button>

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((page) => (
        <button
          key={page}
          type="button"
          className={
            page === pageNumber
              ? 'pagination__button pagination__button--active'
              : 'pagination__button'
          }
          aria-current={
            page === pageNumber
              ? 'page'
              : undefined
          }
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        className="pagination__button"
        disabled={pageNumber === totalPages}
        aria-label="Next page"
        onClick={() => onPageChange(pageNumber + 1)}
      >
        ›
      </button>
    </nav>
  )
}