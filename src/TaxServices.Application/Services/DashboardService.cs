using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Dashboard;
using TaxServices.Application.DTOs.Dashboard;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Cases;
using TaxServices.Domain.Invoices;
using TaxServices.Domain.Payments;

namespace TaxServices.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly ITaxServicesDbContext _context;
        private readonly ITenantContext _tenantContext;

        public DashboardService(
            ITaxServicesDbContext context,
            ITenantContext tenantContext)
        {
            _context = context;
            _tenantContext = tenantContext;
        }

        public async Task<StaffDashboardResponse> GetStaffDashboardAsync(CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var totalClients = await _context.Clients
                .AsNoTracking()
                .CountAsync(
                    c => c.TenantId == tenantId,
                    cancellationToken);

            var activeEmployees = await _context.Employees
                .AsNoTracking()
                .CountAsync(
                    e => e.TenantId == tenantId &&
                         e.IsActive,
                    cancellationToken);

            var openTaxCases = await _context.TaxCases
                .AsNoTracking()
                .CountAsync(
                    tc => tc.TenantId == tenantId &&
                          (
                              tc.Status == CaseStatus.Open ||
                              tc.Status == CaseStatus.InProgress
                          ),
                    cancellationToken);

            var waitingForClientCases = await _context.TaxCases
                .AsNoTracking()
                .CountAsync(
                    tc => tc.TenantId == tenantId &&
                          tc.Status == CaseStatus.WaitingForClient,
                    cancellationToken);

            var totalDocuments = await _context.Documents
                .AsNoTracking()
                .CountAsync(
                    d => d.TenantId == tenantId,
                    cancellationToken);

            var recentTaxCases = await _context.TaxCases
                .AsNoTracking()
                .Where(tc => tc.TenantId == tenantId)
                .OrderByDescending(tc => tc.OpenedAt)
                .Take(5)
                .Select(tc => new RecentTaxCaseResponse
                {
                    Id = tc.Id,
                    ClientName =
                        tc.Client.FirstName + " " +
                        tc.Client.LastName,
                    TaxYear = tc.TaxYear,
                    Status = tc.Status,
                    OpenedAt = tc.OpenedAt
                })
                .ToListAsync(cancellationToken);

            var finance = await GetFinanceAsync(tenantId, null, cancellationToken);

            return new StaffDashboardResponse
            {
                TotalInvoiced = finance.TotalInvoiced,
                TotalCollected = finance.TotalCollected,
                OutstandingBalance = finance.OutstandingBalance,
                UnpaidInvoices = finance.UnpaidInvoices,
                OverdueInvoices = finance.OverdueInvoices,
                RecentInvoices = finance.RecentInvoices,
                TotalClients = totalClients,
                ActiveEmployees = activeEmployees,
                OpenTaxCases = openTaxCases,
                WaitingForClientCases = waitingForClientCases,
                TotalDocuments = totalDocuments,
                RecentTaxCases = recentTaxCases
            };
        }

        public async Task<ClientDashboardResponse?> GetClientDashboardAsync(string userId, CancellationToken cancellationToken = default)
        {
            var tenantId = _tenantContext.TenantId;

            var clientId = await _context.Clients
                .AsNoTracking()
                .Where(c =>
                    c.UserId == userId &&
                    c.TenantId == tenantId)
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (!clientId.HasValue)
                return null;

            var activeTaxCases = await _context.TaxCases
                .AsNoTracking()
                .CountAsync(
                    tc =>
                        tc.ClientId == clientId.Value &&
                        tc.TenantId == tenantId &&
                        (
                            tc.Status == CaseStatus.Open ||
                            tc.Status == CaseStatus.InProgress
                        ),
                    cancellationToken);

            var waitingForClientCases = await _context.TaxCases
                .AsNoTracking()
                .CountAsync(
                    tc =>
                        tc.ClientId == clientId.Value &&
                        tc.TenantId == tenantId &&
                        tc.Status == CaseStatus.WaitingForClient,
                    cancellationToken);

            var totalDocuments = await _context.Documents
                .AsNoTracking()
                .CountAsync(
                    d =>
                        d.ClientId == clientId.Value &&
                        d.TenantId == tenantId,
                    cancellationToken);

            var recentTaxCases = await _context.TaxCases
                .AsNoTracking()
                .Where(tc =>
                    tc.ClientId == clientId.Value &&
                    tc.TenantId == tenantId)
                .OrderByDescending(tc => tc.OpenedAt)
                .Take(5)
                .Select(tc => new ClientRecentTaxCaseResponse
                {
                    Id = tc.Id,

                    ServiceName = _context.Services
                        .Where(s =>
                            s.Id == tc.ServiceId &&
                            s.TenantId == tenantId)
                        .Select(s => s.Name)
                        .FirstOrDefault() ?? string.Empty,

                    TaxYear = tc.TaxYear,
                    Status = tc.Status,
                    OpenedAt = tc.OpenedAt
                })
                .ToListAsync(cancellationToken);

            var finance = await GetFinanceAsync(tenantId, clientId.Value, cancellationToken);

            return new ClientDashboardResponse
            {
                TotalInvoiced = finance.TotalInvoiced,
                TotalCollected = finance.TotalCollected,
                OutstandingBalance = finance.OutstandingBalance,
                UnpaidInvoices = finance.UnpaidInvoices,
                OverdueInvoices = finance.OverdueInvoices,
                RecentInvoices = finance.RecentInvoices,
                ActiveTaxCases = activeTaxCases,
                WaitingForClientCases = waitingForClientCases,
                TotalDocuments = totalDocuments,
                RecentTaxCases = recentTaxCases
            };
        }

        private async Task<FinanceSummary> GetFinanceAsync(Guid tenantId, Guid? clientId, CancellationToken ct)
        {
            // Draft/cancelled invoices are excluded. Payment totals use successful transactions only.
            var invoices = await _context.Invoices.AsNoTracking()
                .Where(i => i.TenantId == tenantId &&
                    (!clientId.HasValue || i.ClientId == clientId.Value) &&
                    i.Status != InvoiceStatus.Draft && i.Status != InvoiceStatus.Cancelled)
                .Select(i => new { i.Id, i.InvoiceNumber, i.TotalAmount, i.IssueDate,
                    i.DueDate, i.Status, ClientName = i.Client.FirstName + " " + i.Client.LastName })
                .ToListAsync(ct);
            var ids = invoices.Select(i => i.Id).ToList();
            var payments = await _context.Payments.AsNoTracking()
                .Where(p => p.TenantId == tenantId && ids.Contains(p.InvoiceId) &&
                    p.Status == PaymentStatus.Succeeded)
                .GroupBy(p => p.InvoiceId)
                .Select(g => new { InvoiceId = g.Key, Amount = g.Sum(p => p.Amount) })
                .ToListAsync(ct);
            var paid = payments.ToDictionary(p => p.InvoiceId, p => p.Amount);
            var now = DateTime.UtcNow.Date;
            var rows = invoices.Select(i => new { Invoice = i,
                Paid = paid.GetValueOrDefault(i.Id),
                Due = Math.Max(0m, i.TotalAmount - paid.GetValueOrDefault(i.Id)) }).ToList();
            return new FinanceSummary
            {
                TotalInvoiced = rows.Sum(x => x.Invoice.TotalAmount),
                TotalCollected = rows.Sum(x => x.Paid),
                OutstandingBalance = rows.Sum(x => x.Due),
                UnpaidInvoices = rows.Count(x => x.Due > 0),
                OverdueInvoices = rows.Count(x => x.Due > 0 && x.Invoice.DueDate.Date < now),
                RecentInvoices = rows.OrderByDescending(x => x.Invoice.IssueDate).Take(5)
                    .Select(x => new RecentInvoiceDashboardResponse
                    {
                        Id = x.Invoice.Id, InvoiceNumber = x.Invoice.InvoiceNumber,
                        ClientName = x.Invoice.ClientName, TotalAmount = x.Invoice.TotalAmount,
                        PaidAmount = x.Paid, IssueDate = x.Invoice.IssueDate,
                        DueDate = x.Invoice.DueDate, Status = (int)x.Invoice.Status
                    }).ToList()
            };
        }

        private sealed class FinanceSummary
        {
            public decimal TotalInvoiced { get; set; }
            public decimal TotalCollected { get; set; }
            public decimal OutstandingBalance { get; set; }
            public int UnpaidInvoices { get; set; }
            public int OverdueInvoices { get; set; }
            public List<RecentInvoiceDashboardResponse> RecentInvoices { get; set; } = [];
        }

    }
}