import { useMyTaxCases } from '../../features/cases/useMyTaxCases'
import './CasesPage.css'

function getStatusLabel(status: number) {
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
      return 'Unknown'
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

        {!cases || cases.length === 0 ? (
          <div className="cases-page__empty">
            <h2 className="cases-page__empty-title">
              No tax cases yet
            </h2>

            <p className="cases-page__empty-text">
              You don't currently have any tax cases associated with your account.
            </p>
          </div>
        ) : (
          <div className="cases-page__list">
            {cases.map((taxCase) => (
              <article
                key={taxCase.id}
                className="cases-page__card"
              >
                <div className="cases-page__card-header">
                  <div>
                    <span className="cases-page__tax-year-label">
                      Tax Year
                    </span>

                    <h2 className="cases-page__tax-year">
                      {taxCase.taxYear}
                    </h2>
                  </div>

                  <span className="cases-page__status">
                    {getStatusLabel(taxCase.status)}
                  </span>
                </div>

                <div className="cases-page__details">
                  <div className="cases-page__detail">
                    <span className="cases-page__detail-label">
                      Opened
                    </span>

                    <strong className="cases-page__detail-value">
                      {new Date(taxCase.openedAt).toLocaleDateString()}
                    </strong>
                  </div>

                  <div className="cases-page__detail">
                    <span className="cases-page__detail-label">
                      Closed
                    </span>

                    <strong className="cases-page__detail-value">
                      {taxCase.closedAt
                        ? new Date(taxCase.closedAt).toLocaleDateString()
                        : '—'}
                    </strong>
                  </div>
                </div>

                <div className="cases-page__description-block">
                  <span className="cases-page__detail-label">
                    Description
                  </span>

                  <p className="cases-page__case-description">
                    {taxCase.description || 'No description provided.'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
