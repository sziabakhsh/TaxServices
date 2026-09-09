import { Link, useParams } from 'react-router-dom'
import { CaseStatus } from '../../features/cases/case.types'
import { useMyTaxCase } from '../../features/cases/useMyTaxCases'
import './CaseDetailsPage.css'

function getStatusLabel(status: CaseStatus) {
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

function getStatusClassName(status: CaseStatus) {
  switch (status) {
    case CaseStatus.Draft:
      return 'case-details__status case-details__status--draft'

    case CaseStatus.Open:
      return 'case-details__status case-details__status--open'

    case CaseStatus.InProgress:
      return 'case-details__status case-details__status--progress'

    case CaseStatus.WaitingForClient:
      return 'case-details__status case-details__status--waiting'

    case CaseStatus.Completed:
      return 'case-details__status case-details__status--completed'

    case CaseStatus.Cancelled:
      return 'case-details__status case-details__status--cancelled'

    default:
      return 'case-details__status'
  }
}

export default function CaseDetailsPage() {
  const { id = '' } = useParams()

  const {
    data: taxCase,
    isLoading,
    isError,
  } = useMyTaxCase(id)

  if (isLoading) {
    return (
      <section className="case-details">
        <div className="case-details__container">
          <div className="case-details__state">
            Loading case details...
          </div>
        </div>
      </section>
    )
  }

  if (isError || !taxCase) {
    return (
      <section className="case-details">
        <div className="case-details__container">
          <Link
            to="/portal/cases"
            className="case-details__back-link"
          >
            ← Back to cases
          </Link>

          <div className="case-details__state case-details__state--error">
            We couldn't load this case.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="case-details">
      <div className="case-details__container">
        <Link
          to="/portal/cases"
          className="case-details__back-link"
        >
          ← Back to cases
        </Link>

        <div className="case-details__header">
          <div>
            <span className="case-details__eyebrow">
              TAX CASE
            </span>

            <h1 className="case-details__title">
              Tax Year {taxCase.taxYear}
            </h1>

            <p className="case-details__description">
              Review the current status and details of your tax case.
            </p>
          </div>

          <span className={getStatusClassName(taxCase.status)}>
            {getStatusLabel(taxCase.status)}
          </span>
        </div>

        <div className="case-details__card">
          <div className="case-details__field">
            <span className="case-details__label">
              Tax year
            </span>

            <strong className="case-details__value">
              {taxCase.taxYear}
            </strong>
          </div>

          <div className="case-details__field">
            <span className="case-details__label">
              Status
            </span>

            <strong className="case-details__value">
              {getStatusLabel(taxCase.status)}
            </strong>
          </div>

          <div className="case-details__field">
            <span className="case-details__label">
              Opened
            </span>

            <strong className="case-details__value">
              {new Date(taxCase.openedAt).toLocaleDateString()}
            </strong>
          </div>

          <div className="case-details__field">
            <span className="case-details__label">
              Closed
            </span>

            <strong className="case-details__value">
              {taxCase.closedAt
                ? new Date(taxCase.closedAt).toLocaleDateString()
                : 'Not closed'}
            </strong>
          </div>

          <div className="case-details__field case-details__field--wide">
            <span className="case-details__label">
              Description
            </span>

            <p className="case-details__text">
              {taxCase.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}