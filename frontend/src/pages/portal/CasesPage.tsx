import { Link } from 'react-router-dom'

import { CaseStatus } from '../../features/cases/case.types'
import { useMyTaxCases } from '../../features/cases/useMyTaxCases'

import './CasesPage.css'

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
      return 'cases-page__status cases-page__status--draft'

    case CaseStatus.Open:
      return 'cases-page__status cases-page__status--open'

    case CaseStatus.InProgress:
      return 'cases-page__status cases-page__status--progress'

    case CaseStatus.WaitingForClient:
      return 'cases-page__status cases-page__status--waiting'

    case CaseStatus.Completed:
      return 'cases-page__status cases-page__status--completed'

    case CaseStatus.Cancelled:
      return 'cases-page__status cases-page__status--cancelled'

    default:
      return 'cases-page__status'
  }
}

export default function CasesPage() {
  const {
    data: cases,
    isLoading,
    isError,
  } = useMyTaxCases()

  if (isLoading) {
    return (
      <section className="cases-page">
        <div className="cases-page__container">
          <div className="cases-page__state">
            Loading your tax cases...
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="cases-page">
        <div className="cases-page__container">
          <div className="cases-page__state cases-page__state--error">
            We couldn't load your tax cases.
          </div>
        </div>
      </section>
    )
  }

  const sortedCases = [...(cases ?? [])].sort((a, b) => {
    if (b.taxYear !== a.taxYear) {
      return b.taxYear - a.taxYear
    }

    return (
      new Date(b.openedAt).getTime() -
      new Date(a.openedAt).getTime()
    )
  })

  return (
    <section className="cases-page">
      <div className="cases-page__container">
        <span className="cases-page__eyebrow">
          TAX SERVICES
        </span>

        <h1 className="cases-page__title">
          Tax Cases
        </h1>

        <p className="cases-page__description">
          Review your current and previous tax service cases.
        </p>

        {sortedCases.length === 0 ? (
          <div className="cases-page__empty">
            <h2 className="cases-page__empty-title">
              No tax cases yet
            </h2>

            <p className="cases-page__empty-text">
              You don't currently have any tax cases associated
              with your account.
            </p>
          </div>
        ) : (
          <div className="cases-page__list">
            {sortedCases.map((taxCase) => (
              <article
                key={taxCase.id}
                className="cases-page__card"
              >
                <div className="cases-page__card-header">
                  <div>
                    <span className="cases-page__service-label">
                      Service
                    </span>

                    <h2 className="cases-page__service-name">
                      {taxCase.serviceName}
                    </h2>
                  </div>

                  <span
                    className={getStatusClassName(
                      taxCase.status
                    )}
                  >
                    {getStatusLabel(taxCase.status)}
                  </span>
                </div>

                <div className="cases-page__details">
                  <div className="cases-page__detail">
                    <span className="cases-page__detail-label">
                      Tax Year
                    </span>

                    <strong className="cases-page__detail-value">
                      {taxCase.taxYear}
                    </strong>
                  </div>

                  <div className="cases-page__detail">
                    <span className="cases-page__detail-label">
                      Opened
                    </span>

                    <strong className="cases-page__detail-value">
                      {new Date(
                        taxCase.openedAt
                      ).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="cases-page__detail">
                    <span className="cases-page__detail-label">
                      Closed
                    </span>

                    <strong className="cases-page__detail-value">
                      {taxCase.closedAt
                        ? new Date(
                            taxCase.closedAt
                          ).toLocaleDateString()
                        : '—'}
                    </strong>
                  </div>
                </div>

                <div className="cases-page__description-block">
                  <span className="cases-page__detail-label">
                    Description
                  </span>

                  <p className="cases-page__case-description">
                    {taxCase.description ||
                      'No description provided.'}
                  </p>
                </div>

                <Link
                  to={`/portal/cases/${taxCase.id}`}
                  className="cases-page__details-link"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}