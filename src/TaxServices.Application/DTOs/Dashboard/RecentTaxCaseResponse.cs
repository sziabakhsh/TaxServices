
using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Dashboard
{
    public class RecentTaxCaseResponse
    {
        public Guid Id { get; set; }

        public string ClientName { get; set; } = string.Empty;

        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        public DateTime OpenedAt { get; set; }
    }
}
