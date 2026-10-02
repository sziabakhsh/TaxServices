using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaxServices.Application.DTOs.Invoices;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoicesController(
            IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<InvoiceResponse>>> GetAll(
            CancellationToken cancellationToken)
        {
            var invoices =
                await _invoiceService.GetAllAsync(
                    cancellationToken);

            return Ok(invoices);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InvoiceResponse>> GetById(
            Guid id,
            CancellationToken cancellationToken)
        {
            var invoice =
                await _invoiceService.GetByIdAsync(
                    id,
                    cancellationToken);

            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }

        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<InvoiceResponse>>> GetByClient(
            Guid clientId,
            CancellationToken cancellationToken)
        {
            var invoices =
                await _invoiceService.GetByClientIdAsync(
                    clientId,
                    cancellationToken);

            return Ok(invoices);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InvoiceResponse>> Create(
            CreateInvoiceRequest request,
            CancellationToken cancellationToken)
        {
            var invoice =
                await _invoiceService.CreateAsync(
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = invoice.Id },
                invoice);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InvoiceResponse>> Update(
            Guid id,
            UpdateInvoiceRequest request,
            CancellationToken cancellationToken)
        {
            var invoice =
                await _invoiceService.UpdateAsync(
                    id,
                    request,
                    cancellationToken);

            return Ok(invoice);
        }

        [HttpPost("{id:guid}/issue")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InvoiceResponse>> Issue(
    Guid id,
    CancellationToken cancellationToken)
        {
            var invoice = await _invoiceService.IssueAsync(
                id,
                cancellationToken);

            return Ok(invoice);
        }

        [HttpPost("{id:guid}/cancel")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InvoiceResponse>> Cancel(
            Guid id,
            CancellationToken cancellationToken)
        {
            var invoice = await _invoiceService.CancelAsync(
                id,
                cancellationToken);

            return Ok(invoice);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<IEnumerable<InvoiceResponse>>> GetMine(
    CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var invoices = await _invoiceService.GetMineAsync(
                userId,
                cancellationToken);

            return Ok(invoices);
        }

        [HttpGet("me/{id:guid}")]
        [Authorize(Roles = "Client")]
        public async Task<ActionResult<InvoiceResponse>> GetMineById(
    Guid id,
    CancellationToken cancellationToken)
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var invoice = await _invoiceService.GetMineByIdAsync(
                userId,
                id,
                cancellationToken);

            if (invoice == null)
                return NotFound();

            return Ok(invoice);
        }
    }
}