using TaxServices.Domain.Documents;
namespace TaxServices.Application.DTOs.Signatures;
public class DocumentSignatureResponse
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid ClientId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public SignatureStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? DeclinedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string DocumentHash { get; set; } = string.Empty;
    public string? SignerName { get; set; }
    public string? SignatureText { get; set; }
    public bool ConsentAccepted { get; set; }
    public string? DeclineReason { get; set; }
    public IReadOnlyCollection<SignatureEventResponse> Events { get; set; } = Array.Empty<SignatureEventResponse>();
}
