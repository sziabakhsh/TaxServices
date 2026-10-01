using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Common;

namespace TaxServices.Domain.Documents;

public class DocumentSignatureEvent : Entity
{
    public Guid DocumentSignatureId { get; set; }
    public SignatureEventType EventType { get; set; }
    public DateTime OccurredAt { get; set; }

    [MaxLength(64)]
    public string? IpAddress { get; set; }

    [MaxLength(500)]
    public string? UserAgent { get; set; }

    [MaxLength(1000)]
    public string? Details { get; set; }

    public DocumentSignature DocumentSignature { get; set; } = null!;
}
