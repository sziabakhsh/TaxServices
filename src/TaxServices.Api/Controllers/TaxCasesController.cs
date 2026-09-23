using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Cases;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaxCasesController : ControllerBase
    {
        private readonly ITaxCaseService _taxCaseService;

        public TaxCasesController(ITaxCaseService taxCaseService)
        {
            _taxCaseService = taxCaseService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<TaxCaseResponse>>> GetAll([FromQuery] TaxCaseQueryParameters parameters, CancellationToken cancellationToken)
        {
            var taxCases = await _taxCaseService.GetAllAsync(parameters, cancellationToken);

            return Ok(taxCases);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<TaxCaseResponse>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var taxCase = await _taxCaseService.GetByIdAsync(id, cancellationToken);

            if (taxCase == null)
                return NotFound();

            return Ok(taxCase);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<TaxCaseResponse>> Create(CreateTaxCaseRequest request, CancellationToken cancellationToken)
        {
            var taxCase = await _taxCaseService.CreateAsync(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = taxCase.Id },
                taxCase);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<TaxCaseResponse>> Update(Guid id, UpdateTaxCaseRequest request, CancellationToken cancellationToken)
        {
            var taxCase = await _taxCaseService.UpdateAsync(id, request, cancellationToken);

            return Ok(taxCase);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<IEnumerable<TaxCaseResponse>>> GetMine(CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var taxCases = await _taxCaseService.GetMineAsync(
                userId,
                cancellationToken);

            return Ok(taxCases);
        }

        [HttpGet("me/{id:guid}")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<TaxCaseResponse>> GetMineById(Guid id, CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var taxCase = await _taxCaseService.GetMineByIdAsync(userId, id, cancellationToken);

            if (taxCase is null)
                return NotFound();

            return Ok(taxCase);
        }

        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<TaxCaseResponse>>> GetByClient(Guid clientId, CancellationToken cancellationToken)
        {
            var taxCases = await _taxCaseService.GetByClientIdAsync(clientId, cancellationToken);

            return Ok(taxCases);
        }
    }
}
