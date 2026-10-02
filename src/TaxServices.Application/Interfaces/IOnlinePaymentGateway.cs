namespace TaxServices.Application.Interfaces;

public interface IOnlinePaymentGateway
{
    Task<OnlineCheckoutResult> CreateCheckoutAsync(
        Guid paymentId,
        Guid invoiceId,
        Guid tenantId,
        string invoiceNumber,
        decimal amount,
        CancellationToken cancellationToken = default);

    OnlinePaymentEvent ParseWebhook(string json, string signatureHeader);
}

public record OnlineCheckoutResult(string SessionId, string Url);

public record OnlinePaymentEvent(
    string EventId,
    string EventType,
    string? SessionId,
    string? PaymentStatus,
    Guid? PaymentId,
    Guid? InvoiceId,
    Guid? TenantId);
