using Microsoft.EntityFrameworkCore;
using TaxServices.Application.Dashboard;
using TaxServices.Application.DTOs.Dashboard;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Cases;

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

            return new StaffDashboardResponse
            {
                TotalClients = totalClients,
                ActiveEmployees = activeEmployees,
                OpenTaxCases = openTaxCases,
                WaitingForClientCases = waitingForClientCases,
                TotalDocuments = totalDocuments,
                RecentTaxCases = recentTaxCases
            };
        }
    }
}