using TaxServices.Application.DTOs.Signatures;
namespace TaxServices.Application.Interfaces;
public interface IDocumentSignatureService
{
    Task<DocumentSignatureResponse> RequestAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<DocumentSignatureResponse>> GetByDocumentAsync(Guid documentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<DocumentSignatureResponse>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<DocumentSignatureResponse?> GetForClientByIdAsync(Guid signatureId, Guid clientId, CancellationToken cancellationToken = default);
    Task<DocumentSignatureResponse> MarkViewedAsync(Guid signatureId, Guid clientId, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default);
    Task<DocumentSignatureResponse> SignAsync(Guid signatureId, Guid clientId, SignDocumentRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default);
    Task<DocumentSignatureResponse> DeclineAsync(Guid signatureId, Guid clientId, DeclineSignatureRequest request, string? ipAddress, string? userAgent, CancellationToken cancellationToken = default);
    Task<DocumentSignatureResponse> CancelAsync(Guid signatureId, CancellationToken cancellationToken = default);
}
