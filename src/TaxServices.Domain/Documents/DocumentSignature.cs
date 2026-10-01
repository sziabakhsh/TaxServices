using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Documents;

public class DocumentSignature : Entity
{
    public Guid DocumentId { get; set; }
    public Guid ClientId { get; set; }
    public SignatureStatus Status { get; set; } = SignatureStatus.Pending;
    public DateTime RequestedAt { get; set; }
    public DateTime? ViewedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? DeclinedAt { get; set; }
    public DateTime? CancelledAt { get; set; }

    [Required, MaxLength(64)]
    public string DocumentHash { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? SignerName { get; set; }

    [MaxLength(200)]
    public string? SignatureText { get; set; }

    public bool ConsentAccepted { get; set; }

    [MaxLength(1000)]
    public string? DeclineReason { get; set; }

    [MaxLength(64)]
    public string? SignedIpAddress { get; set; }

    [MaxLength(500)]
    public string? SignedUserAgent { get; set; }

    public Document Document { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public ICollection<DocumentSignatureEvent> Events { get; set; } = new List<DocumentSignatureEvent>();
}
