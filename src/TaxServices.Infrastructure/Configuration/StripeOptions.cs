namespace TaxServices.Infrastructure.Configuration;

public class StripeOptions
{
    public const string SectionName = "Stripe";
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string Currency { get; set; } = "cad";
    public string SuccessPath { get; set; } = "/portal/invoices/payment-success";
    public string CancelPath { get; set; } = "/portal/invoices/payment-cancelled";
}
