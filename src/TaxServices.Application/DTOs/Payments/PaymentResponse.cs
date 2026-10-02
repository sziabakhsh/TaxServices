using TaxServices.Domain.Payments;

namespace TaxServices.Application.DTOs.Payments;

public class PaymentResponse
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? Provider { get; set; }
    public string? ProviderPaymentId { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}
