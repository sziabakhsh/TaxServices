using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Authentication;
using TaxServices.Application.DTOs.Clients;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly IAuthService _authService;

        public ClientsController(
            IClientService clientService,
            IAuthService authService)
        {
            _clientService = clientService;
            _authService = authService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<PagedResult<ClientDto>>> GetAll([FromQuery] PaginationQueryParameters parameters, CancellationToken cancellationToken)
        {
            var result = await _clientService.GetAllAsync(parameters, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ClientDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var client = await _clientService.GetByIdAsync(
                id,
                cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ClientCreatedResponse>> Create(
            [FromBody] CreateClientRequest request,
            CancellationToken cancellationToken)
        {
            var response = await _clientService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = response.Client.Id },
                response);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ClientDto>> Update(
    Guid id,
    [FromBody] UpdateClientRequest request,
    CancellationToken cancellationToken)
        {
            var client = await _clientService.UpdateAsync(
                id,
                request,
                cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            var response =
                await _authService.RegisterAsync(request);

            return Ok(response);
        }

        [HttpPatch("{id:guid}/activate")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken)
        {
            var result = await _clientService.ActivateAsync(
                id,
                cancellationToken);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:guid}/deactivate")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
        {
            var result = await _clientService.DeactivateAsync(id, cancellationToken);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("me")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<ClientDto>> GetCurrent(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var client = await _clientService.GetCurrentAsync(
                userId,
                cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }

        [Authorize(Roles = "Client")]
        [HttpPut("me")]
        public async Task<ActionResult<ClientDto>> UpdateCurrent([FromBody] UpdateClientRequest request, CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId is null)
                return Unauthorized();

            var client = await _clientService.UpdateCurrentAsync(userId, request, cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }
    }
}
