using TaxServices.Application.Dashboard;
using TaxServices.Application.DTOs.Dashboard;

namespace TaxServices.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<StaffDashboardResponse> GetStaffDashboardAsync(CancellationToken cancellationToken = default);

        Task<ClientDashboardResponse?> GetClientDashboardAsync(string userId, CancellationToken cancellationToken = default);
    }
}