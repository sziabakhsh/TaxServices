using System.ComponentModel.DataAnnotations;

namespace TaxServices.Application.DTOs.Payments;

public class CreateCheckoutSessionRequest
{
    [Required]
    public Guid InvoiceId { get; set; }

    // Null means pay the full outstanding balance.
    [Range(typeof(decimal), "0.01", "9999999999999999")]
    public decimal? Amount { get; set; }
}
