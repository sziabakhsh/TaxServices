using TaxServices.Application.DTOs.Dashboard;

namespace TaxServices.Application.Dashboard;

public class StaffDashboardResponse
{
    public int TotalClients { get; set; }

    public int ActiveEmployees { get; set; }

    public int OpenTaxCases { get; set; }

    public int WaitingForClientCases { get; set; }

    public int TotalDocuments { get; set; }
    public List<RecentTaxCaseResponse> RecentTaxCases { get; set; } = new();
}