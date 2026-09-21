using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.Dashboard;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Employee")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("staff")]
        [ProducesResponseType(
            typeof(StaffDashboardResponse),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<StaffDashboardResponse>> GetStaffDashboard(
            CancellationToken cancellationToken)
        {
            var dashboard =
                await _dashboardService.GetStaffDashboardAsync(
                    cancellationToken);

            return Ok(dashboard);
        }
    }
}
