using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.Common.Pagination;
using TaxServices.Application.DTOs.Documents;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentService _documentService;
        private readonly IClientService _clientService;

        public DocumentsController(IDocumentService documentService, IClientService clientService)
        {
            _documentService = documentService;
            _clientService = clientService;
        }

        [Authorize(Roles = "Admin,Employee")]
        [Consumes("multipart/form-data")]
        [HttpPost("upload")]
        public async Task<ActionResult<DocumentResponse>> Upload(Guid clientId, Guid? taxCaseId, IFormFile file, CancellationToken cancellationToken)
        {
            await using var stream = file.OpenReadStream();

            var request = new UploadDocumentRequest
            {
                ClientId = clientId,
                TaxCaseId = taxCaseId,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                Content = stream
            };

            var document = await _documentService.UploadAsync(request, cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = document.Id },
                document);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<DocumentResponse>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var document = await _documentService.GetByIdAsync(id, cancellationToken);

            if (document == null)
                return NotFound();

            return Ok(document);
        }

        [HttpGet("client/{clientId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<DocumentResponse>>> GetByClient(Guid clientId, CancellationToken cancellationToken)
        {
            var documents = await _documentService.GetByClientAsync(clientId, cancellationToken);

            return Ok(documents);
        }

        [HttpGet("case/{taxCaseId:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IEnumerable<DocumentResponse>>> GetByTaxCase(Guid taxCaseId, CancellationToken cancellationToken)
        {
            var documents = await _documentService.GetByTaxCaseAsync(taxCaseId, cancellationToken);

            return Ok(documents);
        }

        [HttpGet("{id:guid}/download")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
        {
            var document = await _documentService.GetByIdAsync(id, cancellationToken);

            if (document == null)
                return NotFound();

            var stream = await _documentService.DownloadAsync(id, cancellationToken);

            if (stream == null)
                return NotFound();

            return File(
                stream,
                document.ContentType,
                document.FileName);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var document = await _documentService.GetByIdAsync(id, cancellationToken);

            if (document == null)
                return NotFound();

            await _documentService.DeleteAsync(id, cancellationToken);

            return NoContent();
        }

        [Authorize]
        [Consumes("multipart/form-data")]
        [HttpPost("mine/upload")]
        public async Task<ActionResult<DocumentResponse>> UploadMine(Guid? taxCaseId, IFormFile file, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var client = await _clientService.GetCurrentAsync(userId, cancellationToken);

            if (client == null)
                return NotFound("Client profile was not found.");

            await using var stream = file.OpenReadStream();

            var request = new UploadDocumentRequest
            {
                ClientId = client.Id,
                TaxCaseId = taxCaseId,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSize = file.Length,
                Content = stream
            };

            var document = await _documentService.UploadAsync(
                request,
                cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = document.Id },
                document);
        }

        [HttpGet("mine")]
        public async Task<ActionResult<IEnumerable<DocumentResponse>>> GetMine(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var client = await _clientService.GetCurrentAsync(
                userId,
                cancellationToken);

            if (client == null)
                return NotFound("Client profile was not found.");

            var documents = await _documentService.GetByClientAsync(
                client.Id,
                cancellationToken);

            return Ok(documents);
        }

        [HttpGet("mine/{id:guid}/download")]
        public async Task<IActionResult> DownloadMine(Guid id, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var client = await _clientService.GetCurrentAsync(
                userId,
                cancellationToken);

            if (client == null)
                return NotFound("Client profile was not found.");

            var document = await _documentService.GetByIdAsync(
                id,
                cancellationToken);

            if (document == null ||
                document.ClientId != client.Id)
            {
                return NotFound();
            }

            var stream = await _documentService.DownloadAsync(
                id,
                cancellationToken);

            if (stream == null)
                return NotFound();

            return File(
                stream,
                document.ContentType,
                document.FileName);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<PagedResult<DocumentResponse>>> GetAll([FromQuery] DocumentQueryParameters parameters, CancellationToken cancellationToken)
        {
            var documents = await _documentService.GetAllAsync(
                parameters,
                cancellationToken);

            return Ok(documents);
        }
    }
}
