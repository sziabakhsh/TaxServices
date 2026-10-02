using System.ComponentModel.DataAnnotations;
using TaxServices.Domain.Payments;

namespace TaxServices.Application.DTOs.Payments;

public class CreateManualPaymentRequest
{
    public Guid InvoiceId { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999999999")]
    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; }

    [MaxLength(200)]
    public string? Reference { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
