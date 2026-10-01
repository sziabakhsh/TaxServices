using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using TaxServices.Application.DTOs.Signatures;
using TaxServices.Application.Interfaces;
using TaxServices.Domain.Documents;

namespace TaxServices.Application.Services;

public class DocumentSignatureService : IDocumentSignatureService
{
    private readonly ITaxServicesDbContext _context;
    private readonly IDocumentService _documentService;
    private readonly ITenantContext _tenantContext;

    public DocumentSignatureService(ITaxServicesDbContext context, IDocumentService documentService, ITenantContext tenantContext)
    {
        _context = context;
        _documentService = documentService;
        _tenantContext = tenantContext;
    }

    public async Task<DocumentSignatureResponse> RequestAsync(Guid documentId, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        var document = await _context.Documents.AsNoTracking().FirstOrDefaultAsync(x => x.Id == documentId && x.TenantId == tenantId, cancellationToken)
            ?? throw new KeyNotFoundException("Document not found.");

        var hasActiveRequest = await _context.DocumentSignatures.AsNoTracking().AnyAsync(x => x.TenantId == tenantId && x.DocumentId == documentId && x.Status == SignatureStatus.Pending, cancellationToken);
        if (hasActiveRequest) throw new InvalidOperationException("This document already has a pending signature request.");

        await using var stream = await _documentService.DownloadAsync(documentId, cancellationToken)
            ?? throw new KeyNotFoundException("Document file not found.");
        var hash = await ComputeSha256Async(stream, cancellationToken);
        var now = DateTime.UtcNow;

        var signature = new DocumentSignature
        {
            TenantId = tenantId, DocumentId = document.Id, ClientId = document.ClientId,
            Status = SignatureStatus.Pending, RequestedAt = now, DocumentHash = hash
        };
        signature.Events.Add(NewEvent(tenantId, SignatureEventType.Requested, now, details: "Signature requested by staff."));
        _context.DocumentSignatures.Add(signature);
        await _context.SaveChangesAsync(cancellationToken);
        return (await Query().FirstAsync(x => x.Id == signature.Id, cancellationToken));
    }

    public async Task<IReadOnlyCollection<DocumentSignatureResponse>> GetByDocumentAsync(Guid documentId, CancellationToken cancellationToken = default) =>
        await Query().Where(x => x.DocumentId == documentId).OrderByDescending(x => x.RequestedAt).ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<DocumentSignatureResponse>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default) =>
        await Query().Where(x => x.ClientId == clientId).OrderByDescending(x => x.RequestedAt).ToListAsync(cancellationToken);

    public async Task<DocumentSignatureResponse?> GetForClientByIdAsync(Guid signatureId, Guid clientId, CancellationToken cancellationToken = default) =>
        await Query().FirstOrDefaultAsync(x => x.Id == signatureId && x.ClientId == clientId, cancellationToken);

    public async Task<DocumentSignatureResponse> MarkViewedAsync(Guid signatureId, Guid clientId, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default)
    {
        var signature = await GetPendingForClient(signatureId, clientId, cancellationToken);
        if (signature.ViewedAt is null)
        {
            var now = DateTime.UtcNow;
            signature.ViewedAt = now;
            AddEvent(signature, SignatureEventType.Viewed, now, ipAddress, userAgent);
            await _context.SaveChangesAsync(cancellationToken);
        }
        return await Query().FirstAsync(x => x.Id == signatureId, cancellationToken);
    }

    public async Task<DocumentSignatureResponse> SignAsync(Guid signatureId, Guid clientId, SignDocumentRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default)
    {
        if (!request.ConsentAccepted) throw new ArgumentException("Electronic signature consent must be accepted.");
        if (string.IsNullOrWhiteSpace(request.SignerName) || string.IsNullOrWhiteSpace(request.SignatureText)) throw new ArgumentException("Signer name and signature are required.");

        var signature = await GetPendingForClient(signatureId, clientId, cancellationToken);
        await EnsureDocumentUnchanged(signature, cancellationToken);
        var now = DateTime.UtcNow;
        signature.Status = SignatureStatus.Signed;
        signature.SignedAt = now;
        signature.ViewedAt ??= now;
        signature.SignerName = request.SignerName.Trim();
        signature.SignatureText = request.SignatureText.Trim();
        signature.ConsentAccepted = true;
        signature.SignedIpAddress = Trim(ipAddress, 64);
        signature.SignedUserAgent = Trim(userAgent, 500);
        AddEvent(signature, SignatureEventType.Signed, now, ipAddress, userAgent, "Electronic signature consent accepted.");
        await _context.SaveChangesAsync(cancellationToken);
        return await Query().FirstAsync(x => x.Id == signatureId, cancellationToken);
    }

    public async Task<DocumentSignatureResponse> DeclineAsync(Guid signatureId, Guid clientId, DeclineSignatureRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Reason)) throw new ArgumentException("Decline reason is required.");
        var signature = await GetPendingForClient(signatureId, clientId, cancellationToken);
        var now = DateTime.UtcNow;
        signature.Status = SignatureStatus.Declined;
        signature.DeclinedAt = now;
        signature.DeclineReason = request.Reason.Trim();
        AddEvent(signature, SignatureEventType.Declined, now, ipAddress, userAgent, signature.DeclineReason);
        await _context.SaveChangesAsync(cancellationToken);
        return await Query().FirstAsync(x => x.Id == signatureId, cancellationToken);
    }

    public async Task<DocumentSignatureResponse> CancelAsync(Guid signatureId, CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantContext.TenantId;
        var signature = await _context.DocumentSignatures.FirstOrDefaultAsync(x => x.Id == signatureId && x.TenantId == tenantId, cancellationToken)
            ?? throw new KeyNotFoundException("Signature request not found.");
        if (signature.Status != SignatureStatus.Pending) throw new InvalidOperationException("Only a pending signature request can be cancelled.");
        var now = DateTime.UtcNow;
        signature.Status = SignatureStatus.Cancelled;
        signature.CancelledAt = now;
        AddEvent(signature, SignatureEventType.Cancelled, now, details: "Signature request cancelled by staff.");
        await _context.SaveChangesAsync(cancellationToken);
        return await Query().FirstAsync(x => x.Id == signatureId, cancellationToken);
    }

    private async Task<DocumentSignature> GetPendingForClient(Guid signatureId, Guid clientId, CancellationToken cancellationToken)
    {
        var tenantId = _tenantContext.TenantId;
        var signature = await _context.DocumentSignatures.FirstOrDefaultAsync(x => x.Id == signatureId && x.ClientId == clientId && x.TenantId == tenantId, cancellationToken)
            ?? throw new KeyNotFoundException("Signature request not found.");
        if (signature.Status != SignatureStatus.Pending) throw new InvalidOperationException("This signature request is no longer pending.");
        return signature;
    }

    private async Task EnsureDocumentUnchanged(DocumentSignature signature, CancellationToken cancellationToken)
    {
        await using var stream = await _documentService.DownloadAsync(signature.DocumentId, cancellationToken)
            ?? throw new KeyNotFoundException("Document file not found.");
        var currentHash = await ComputeSha256Async(stream, cancellationToken);
        if (!CryptographicOperations.FixedTimeEquals(Convert.FromHexString(currentHash), Convert.FromHexString(signature.DocumentHash)))
            throw new InvalidOperationException("The document has changed since the signature was requested. A new signature request is required.");
    }

    private IQueryable<DocumentSignatureResponse> Query()
    {
        var tenantId = _tenantContext.TenantId;
        return _context.DocumentSignatures.AsNoTracking().Where(x => x.TenantId == tenantId).Select(x => new DocumentSignatureResponse
        {
            Id = x.Id, DocumentId = x.DocumentId, ClientId = x.ClientId, FileName = x.Document.OriginalFileName,
            Status = x.Status, RequestedAt = x.RequestedAt, ViewedAt = x.ViewedAt, SignedAt = x.SignedAt,
            DeclinedAt = x.DeclinedAt, CancelledAt = x.CancelledAt, DocumentHash = x.DocumentHash,
            SignerName = x.SignerName, SignatureText = x.SignatureText, ConsentAccepted = x.ConsentAccepted, DeclineReason = x.DeclineReason,
            Events = x.Events.OrderBy(e => e.OccurredAt).Select(e => new SignatureEventResponse { Id = e.Id, EventType = e.EventType, OccurredAt = e.OccurredAt, Details = e.Details }).ToArray()
        });
    }

    private void AddEvent(DocumentSignature signature, SignatureEventType type, DateTime at, string? ipAddress = null, string? userAgent = null, string? details = null)
    {
        var auditEvent = NewEvent(signature.TenantId, type, at, ipAddress, userAgent, details);
        auditEvent.DocumentSignatureId = signature.Id;
        _context.DocumentSignatureEvents.Add(auditEvent);
    }

    private static DocumentSignatureEvent NewEvent(Guid tenantId, SignatureEventType type, DateTime at, string? ipAddress = null, string? userAgent = null, string? details = null) =>
        new() { TenantId = tenantId, EventType = type, OccurredAt = at, IpAddress = Trim(ipAddress, 64), UserAgent = Trim(userAgent, 500), Details = Trim(details, 1000) };

    private static string? Trim(string? value, int max) => string.IsNullOrWhiteSpace(value) ? null : value.Trim()[..Math.Min(value.Trim().Length, max)];

    private static async Task<string> ComputeSha256Async(Stream stream, CancellationToken cancellationToken)
    {
        if (stream.CanSeek) stream.Position = 0;
        using var sha = SHA256.Create();
        var hash = await sha.ComputeHashAsync(stream, cancellationToken);
        return Convert.ToHexString(hash);
    }
}
