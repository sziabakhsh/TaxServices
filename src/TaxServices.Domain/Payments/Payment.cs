using TaxServices.Domain.Common;
using TaxServices.Domain.Invoices;

namespace TaxServices.Domain.Payments;

public class Payment : Entity
{
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
    public Invoice Invoice { get; set; } = null!;
}
