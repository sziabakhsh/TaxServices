using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Dashboard
{
    public class ClientDashboardResponse
    {
        public int ActiveTaxCases { get; set; }

        public int WaitingForClientCases { get; set; }

        public int TotalDocuments { get; set; }

        public List<ClientRecentTaxCaseResponse> RecentTaxCases { get; set; } = [];
    }

    public class ClientRecentTaxCaseResponse
    {
        public Guid Id { get; set; }

        public string ServiceName { get; set; } = string.Empty;

        public int TaxYear { get; set; }

        public CaseStatus Status { get; set; }

        public DateTime OpenedAt { get; set; }
    }
}