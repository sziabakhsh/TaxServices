using TaxServices.Application.Dashboard;

namespace TaxServices.Application.Interfaces
{
    public interface IDashboardService
    {
        Task<StaffDashboardResponse> GetStaffDashboardAsync(CancellationToken cancellationToken = default);
    }
}
