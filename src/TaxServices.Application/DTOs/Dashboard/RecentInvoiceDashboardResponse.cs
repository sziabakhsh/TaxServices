namespace TaxServices.Application.DTOs.Dashboard;

public class RecentInvoiceDashboardResponse
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public int Status { get; set; }
}
