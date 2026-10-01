using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.DTOs.Signatures;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/document-signatures")]
public class DocumentSignaturesController : ControllerBase
{
    private readonly IDocumentSignatureService _signatureService;
    private readonly IClientService _clientService;

    public DocumentSignaturesController(IDocumentSignatureService signatureService, IClientService clientService)
    {
        _signatureService = signatureService;
        _clientService = clientService;
    }

    [Authorize(Roles = "Admin,Employee")]
    [HttpPost]
    public async Task<ActionResult<DocumentSignatureResponse>> RequestSignature([FromBody] CreateSignatureRequest request, CancellationToken cancellationToken)
    {
        var result = await _signatureService.RequestAsync(request.DocumentId, cancellationToken);
        return CreatedAtAction(nameof(GetByDocument), new { documentId = result.DocumentId }, result);
    }

    [Authorize(Roles = "Admin,Employee")]
    [HttpGet("document/{documentId:guid}")]
    public async Task<ActionResult<IReadOnlyCollection<DocumentSignatureResponse>>> GetByDocument(Guid documentId, CancellationToken cancellationToken) =>
        Ok(await _signatureService.GetByDocumentAsync(documentId, cancellationToken));

    [Authorize(Roles = "Admin,Employee")]
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<DocumentSignatureResponse>> Cancel(Guid id, CancellationToken cancellationToken) =>
        Ok(await _signatureService.CancelAsync(id, cancellationToken));

    [Authorize(Roles = "Client")]
    [HttpGet("mine")]
    public async Task<ActionResult<IReadOnlyCollection<DocumentSignatureResponse>>> GetMine(CancellationToken cancellationToken)
    {
        var client = await GetCurrentClient(cancellationToken);
        if (client is null) return NotFound("Client profile was not found.");
        return Ok(await _signatureService.GetForClientAsync(client.Value, cancellationToken));
    }

    [Authorize(Roles = "Client")]
    [HttpGet("mine/{id:guid}")]
    public async Task<ActionResult<DocumentSignatureResponse>> GetMineById(Guid id, CancellationToken cancellationToken)
    {
        var client = await GetCurrentClient(cancellationToken);
        if (client is null) return NotFound("Client profile was not found.");
        var result = await _signatureService.GetForClientByIdAsync(id, client.Value, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [Authorize(Roles = "Client")]
    [HttpPost("mine/{id:guid}/view")]
    public async Task<ActionResult<DocumentSignatureResponse>> MarkViewed(Guid id, CancellationToken cancellationToken)
    {
        var client = await GetCurrentClient(cancellationToken);
        if (client is null) return NotFound("Client profile was not found.");
        return Ok(await _signatureService.MarkViewedAsync(id, client.Value, GetIp(), Request.Headers.UserAgent.ToString(), cancellationToken));
    }

    [Authorize(Roles = "Client")]
    [HttpPost("mine/{id:guid}/sign")]
    public async Task<ActionResult<DocumentSignatureResponse>> Sign(Guid id, [FromBody] SignDocumentRequest request, CancellationToken cancellationToken)
    {
        var client = await GetCurrentClient(cancellationToken);
        if (client is null) return NotFound("Client profile was not found.");
        return Ok(await _signatureService.SignAsync(id, client.Value, request, GetIp(), Request.Headers.UserAgent.ToString(), cancellationToken));
    }

    [Authorize(Roles = "Client")]
    [HttpPost("mine/{id:guid}/decline")]
    public async Task<ActionResult<DocumentSignatureResponse>> Decline(Guid id, [FromBody] DeclineSignatureRequest request, CancellationToken cancellationToken)
    {
        var client = await GetCurrentClient(cancellationToken);
        if (client is null) return NotFound("Client profile was not found.");
        return Ok(await _signatureService.DeclineAsync(id, client.Value, request, GetIp(), Request.Headers.UserAgent.ToString(), cancellationToken));
    }

    private async Task<Guid?> GetCurrentClient(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return null;
        var client = await _clientService.GetCurrentAsync(userId, cancellationToken);
        return client?.Id;
    }

    private string? GetIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
}
