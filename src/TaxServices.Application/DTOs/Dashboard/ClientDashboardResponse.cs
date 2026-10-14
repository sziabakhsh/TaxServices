using TaxServices.Domain.Cases;

namespace TaxServices.Application.DTOs.Dashboard
{
    public class ClientDashboardResponse
    {

    public decimal TotalInvoiced { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal OutstandingBalance { get; set; }
    public int UnpaidInvoices { get; set; }
    public int OverdueInvoices { get; set; }
    public List<RecentInvoiceDashboardResponse> RecentInvoices { get; set; } = [];

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