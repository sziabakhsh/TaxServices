using TaxServices.Domain.Documents;
namespace TaxServices.Application.DTOs.Signatures;
public class SignatureEventResponse
{
    public Guid Id { get; set; }
    public SignatureEventType EventType { get; set; }
    public DateTime OccurredAt { get; set; }
    public string? Details { get; set; }
}
