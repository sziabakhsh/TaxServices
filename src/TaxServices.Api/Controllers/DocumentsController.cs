using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public DocumentsController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [Authorize(Roles = "Admin,Employee")]
        [Consumes("multipart/form-data")]
        [HttpPost("upload")]
        public async Task<ActionResult<DocumentResponse>> Upload(
            Guid clientId,
            Guid? taxCaseId,
            IFormFile file,
            CancellationToken cancellationToken)
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

            return CreatedAtAction(nameof(GetById), new { id = document.Id }, document);
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

        [HttpGet("{id:guid}/download")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
        {
            var document = await _documentService.GetByIdAsync(
                id,
                cancellationToken);

            if (document == null)
                return NotFound();

            var stream = await _documentService.DownloadAsync(id, cancellationToken);

            if (stream == null)
                return NotFound();

            return File(stream, document.ContentType, document.FileName);
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
    }
}