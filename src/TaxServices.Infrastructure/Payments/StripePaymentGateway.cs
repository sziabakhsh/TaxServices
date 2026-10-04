using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using TaxServices.Application.Interfaces;
using TaxServices.Infrastructure.Configuration;
using TaxServices.Infrastructure.Persistence.Configurations;

namespace TaxServices.Infrastructure.Payments;

public class StripePaymentGateway : IOnlinePaymentGateway
{
    private readonly StripeOptions _stripe;
    private readonly FrontendOptions _frontend;

    public StripePaymentGateway(IOptions<StripeOptions> stripe, IOptions<FrontendOptions> frontend)
    {
        _stripe = stripe.Value;
        _frontend = frontend.Value;
    }

    public async Task<OnlineCheckoutResult> CreateCheckoutAsync(
        Guid paymentId, Guid invoiceId, Guid tenantId, string invoiceNumber,
        decimal amount, CancellationToken cancellationToken = default)
    {
        EnsureConfigured();

        var metadata = new Dictionary<string, string>
        {
            ["payment_id"] = paymentId.ToString(),
            ["invoice_id"] = invoiceId.ToString(),
            ["tenant_id"] = tenantId.ToString()
        };

        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = BuildUrl(_stripe.SuccessPath) + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = BuildUrl(_stripe.CancelPath),
            ClientReferenceId = paymentId.ToString(),
            Metadata = metadata,
            PaymentIntentData = new SessionPaymentIntentDataOptions { Metadata = metadata },
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = _stripe.Currency,
                        UnitAmount = ToMinorUnits(amount),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Invoice {invoiceNumber}"
                        }
                    }
                }
            }
        };

        var client = new StripeClient(_stripe.SecretKey);
        var service = new SessionService(client);
        var requestOptions = new RequestOptions { IdempotencyKey = paymentId.ToString() };
        var session = await service.CreateAsync(options, requestOptions, cancellationToken);

        if (string.IsNullOrWhiteSpace(session.Url))
            throw new InvalidOperationException("Stripe did not return a checkout URL.");

        return new OnlineCheckoutResult(session.Id, session.Url);
    }

    public OnlinePaymentEvent ParseWebhook(string json, string signatureHeader)
    {
        EnsureConfigured();
  
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            signatureHeader,
            _stripe.WebhookSecret,
            throwOnApiVersionMismatch: false);

        var session = stripeEvent.Data.Object as Session;

        Guid? Parse(string key)
            => session?.Metadata.TryGetValue(key, out var value) == true && Guid.TryParse(value, out var id) ? id : null;

        return new OnlinePaymentEvent(
            stripeEvent.Id,
            stripeEvent.Type,
            session?.Id,
            session?.PaymentStatus,
            Parse("payment_id"),
            Parse("invoice_id"),
            Parse("tenant_id"));
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_stripe.SecretKey) || string.IsNullOrWhiteSpace(_stripe.WebhookSecret))
            throw new InvalidOperationException("Stripe configuration is missing.");
        if (string.IsNullOrWhiteSpace(_frontend.BaseUrl))
            throw new InvalidOperationException("Frontend BaseUrl configuration is missing.");
    }

    private string BuildUrl(string path) => $"{_frontend.BaseUrl.TrimEnd('/')}/{path.TrimStart('/')}";

    private static long ToMinorUnits(decimal amount)
        => checked((long)decimal.Round(amount * 100m, 0, MidpointRounding.AwayFromZero));
}
