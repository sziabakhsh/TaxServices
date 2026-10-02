namespace TaxServices.Application.DTOs.Payments;

public class CheckoutSessionResponse
{
    public Guid PaymentId { get; set; }
    public string CheckoutUrl { get; set; } = string.Empty;
}
