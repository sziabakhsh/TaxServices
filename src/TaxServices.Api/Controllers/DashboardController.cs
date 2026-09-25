using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.Dashboard;
using TaxServices.Application.DTOs.Dashboard;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(
            IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("staff")]
        [Authorize(Roles = "Admin,Employee")]
        [ProducesResponseType(
            typeof(StaffDashboardResponse),
            StatusCodes.Status200OK)]
        public async Task<ActionResult<StaffDashboardResponse>>
            GetStaffDashboard(
                CancellationToken cancellationToken)
        {
            var dashboard =
                await _dashboardService.GetStaffDashboardAsync(
                    cancellationToken);

            return Ok(dashboard);
        }

        [HttpGet("client")]
        [Authorize(Roles = "Client")]
        [ProducesResponseType(typeof(ClientDashboardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ClientDashboardResponse>> GetClientDashboard(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var dashboard =
                await _dashboardService.GetClientDashboardAsync(
                    userId,
                    cancellationToken);

            if (dashboard is null)
                return NotFound();

            return Ok(dashboard);
        }
    }
}