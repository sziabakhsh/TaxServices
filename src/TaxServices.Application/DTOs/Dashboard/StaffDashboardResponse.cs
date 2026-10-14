using TaxServices.Application.DTOs.Dashboard;

namespace TaxServices.Application.Dashboard;

public class StaffDashboardResponse
{

    public decimal TotalInvoiced { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal OutstandingBalance { get; set; }
    public int UnpaidInvoices { get; set; }
    public int OverdueInvoices { get; set; }
    public List<RecentInvoiceDashboardResponse> RecentInvoices { get; set; } = [];

    public int TotalClients { get; set; }

    public int ActiveEmployees { get; set; }

    public int OpenTaxCases { get; set; }

    public int WaitingForClientCases { get; set; }

    public int TotalDocuments { get; set; }
    public List<RecentTaxCaseResponse> RecentTaxCases { get; set; } = new();
}