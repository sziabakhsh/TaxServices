using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.DTOs.Clients;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly IClientService _clientService;
        public ClientsController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IReadOnlyList<ClientDto>>> GetAll(CancellationToken cancellationToken)
        {
            var clients = await _clientService.GetAllAsync(
                cancellationToken);

            return Ok(clients);
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
        public async Task<ActionResult<ClientDto>> Create(
            [FromBody] CreateClientRequest request,
            CancellationToken cancellationToken)
        {
            var client = await _clientService.CreateAsync(
                request,
                cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
        }


        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ClientDto>> Update(Guid id, UpdateClientRequest request, CancellationToken cancellationToken)
        {
            var client = await _clientService.UpdateAsync(
                id,
                request,
                cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }

        [HttpPatch("{id:guid}/activate")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Activate(
            Guid id,
            CancellationToken cancellationToken)
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
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var client = await _clientService.GetCurrentAsync(
                userId,
                cancellationToken);

            if (client is null)
                return NotFound();

            return Ok(client);
        }
    }
}
